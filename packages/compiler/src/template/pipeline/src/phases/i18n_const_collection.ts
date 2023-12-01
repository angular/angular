/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {type ConstantPool} from '../../../../constant_pool';
import * as i18n from '../../../../i18n/i18n_ast';
import {mapLiteral} from '../../../../output/map_util';
import * as o from '../../../../output/output_ast';
import {sanitizeIdentifier} from '../../../../parse_util';
import {Identifiers} from '../../../../render3/r3_identifiers';
import {createGoogleGetMsgStatements} from '../../../../render3/view/i18n/get_msg_utils';
import {createLocalizeStatements} from '../../../../render3/view/i18n/localize_utils';
import {declareI18nVariable, formatI18nPlaceholderNamesInMap, getTranslationConstPrefix} from '../../../../render3/view/i18n/util';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/** Name of the global variable that is used to determine if we use Closure translations or not */
const NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';

/**
 * Prefix for non-`goog.getMsg` i18n-related vars.
 * Note: the prefix uses lowercase characters intentionally due to a Closure behavior that
 * considers variables like `I18N_0` as constants and throws an error when their value changes.
 */
const TRANSLATION_VAR_PREFIX = 'i18n_';

/** Prefix of ICU expressions for post processing */
export const I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';

/**
 * The escape sequence used for message param values.
 */
const ESCAPE = '\uFFFD';

/**
 * Lifts i18n properties into the consts array.
 * TODO: Can we use `ConstCollectedExpr`?
 */
export function collectI18nConsts(job: ComponentCompilationJob): void {
  const fileBasedI18nSuffix =
      job.relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() + '_';
  const messageConstIndices = new Map<ir.XrefId, ir.ConstIndex>();

  // Remove all of the i18n message ops into a map.
  const messages = new Map<ir.XrefId, ir.I18nMessageOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nMessage) {
        messages.set(op.xref, op);
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }

  // Serialize the extracted messages for root i18n blocks into the const array.
  for (const op of messages.values()) {
    if (op.kind === ir.OpKind.I18nMessage && op.messagePlaceholder === null) {
      const {mainVar, statements} = collectMessage(job, fileBasedI18nSuffix, messages, op);
      messageConstIndices.set(op.i18nBlock, job.addConst(mainVar, statements));
    }
  }

  // Assign const index to i18n ops that messages were extracted from.
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart) {
        op.messageIndex = messageConstIndices.get(op.root)!;
      }
    }
  }
}

/**
 * Collects the given message into a set of statements that can be added to the const array.
 * This will recursively collect any sub-messages referenced from the parent message as well.
 */
function collectMessage(
    job: ComponentCompilationJob, fileBasedI18nSuffix: string,
    messages: Map<ir.XrefId, ir.I18nMessageOp>,
    messageOp: ir.I18nMessageOp): {mainVar: o.ReadVarExpr, statements: o.Statement[]} {
  // Recursively collect any sub-messages, record each sub-message's main variable under its
  // placeholder so that we can add them to the params for the parent message. It is possible that
  // multiple sub-messages will share the same placeholder, so we need to track an array of
  // variables for each placeholder.
  const statements: o.Statement[] = [];
  const subMessagePlaceholders = new Map<string, o.Expression[]>();
  for (const subMessageId of messageOp.subMessages) {
    const subMessage = messages.get(subMessageId)!;
    const {mainVar: subMessageVar, statements: subMessageStatements} =
        collectMessage(job, fileBasedI18nSuffix, messages, subMessage);
    statements.push(...subMessageStatements);
    const subMessages = subMessagePlaceholders.get(subMessage.messagePlaceholder!) ?? [];
    subMessages.push(subMessageVar);
    subMessagePlaceholders.set(subMessage.messagePlaceholder!, subMessages);
  }
  addSubMessageParams(messageOp, subMessagePlaceholders);

  // Sort the params for consistency with TemaplateDefinitionBuilder output.
  messageOp.params = new Map([...messageOp.params.entries()].sort());

  const mainVar = o.variable(job.pool.uniqueName(TRANSLATION_VAR_PREFIX));
  // Closure Compiler requires const names to start with `MSG_` but disallows any other
  // const to start with `MSG_`. We define a variable starting with `MSG_` just for the
  // `goog.getMsg` call
  const closureVar = i18nGenerateClosureVar(
      job.pool, messageOp.message.id, fileBasedI18nSuffix, job.i18nUseExternalIds);
  let transformFn = undefined;

  // If nescessary, add a post-processing step and resolve any placeholder params that are
  // set in post-processing.
  if (messageOp.needsPostprocessing) {
    // Sort the post-processing params for consistency with TemaplateDefinitionBuilder output.
    const postprocessingParams =
        Object.fromEntries([...messageOp.postprocessingParams.entries()].sort());
    const formattedPostprocessingParams =
        formatI18nPlaceholderNamesInMap(postprocessingParams, /* useCamelCase */ false);
    const extraTransformFnParams: o.Expression[] = [];
    if (messageOp.postprocessingParams.size > 0) {
      extraTransformFnParams.push(mapLiteral(formattedPostprocessingParams, /* quoted */ true));
    }
    transformFn = (expr: o.ReadVarExpr) =>
        o.importExpr(Identifiers.i18nPostprocess).callFn([expr, ...extraTransformFnParams]);
  }

  // Add the message's statements
  statements.push(...getTranslationDeclStmts(
      messageOp.message, mainVar, closureVar, messageOp.params, transformFn));

  return {mainVar, statements};
}

/**
 * Adds the given subMessage placeholders to the given message op.
 *
 * If a placeholder only corresponds to a single sub-message variable, we just set that variable as
 * the param value. However, if the placeholder corresponds to multiple sub-message variables, we
 * need to add a special placeholder value that is handled by the post-processing step. We then add
 * the array of variables as a post-processing param.
 */
function addSubMessageParams(
    messageOp: ir.I18nMessageOp, subMessagePlaceholders: Map<string, o.Expression[]>) {
  for (const [placeholder, subMessages] of subMessagePlaceholders) {
    if (subMessages.length === 1) {
      messageOp.params.set(placeholder, subMessages[0]);
    } else {
      messageOp.params.set(
          placeholder, o.literal(`${ESCAPE}${I18N_ICU_MAPPING_PREFIX}${placeholder}${ESCAPE}`));
      messageOp.postprocessingParams.set(placeholder, o.literalArr(subMessages));
      messageOp.needsPostprocessing = true;
    }
  }
}

/**
 * Generate statements that define a given translation message.
 *
 * ```
 * var I18N_1;
 * if (typeof ngI18nClosureMode !== undefined && ngI18nClosureMode) {
 *     var MSG_EXTERNAL_XXX = goog.getMsg(
 *          "Some message with {$interpolation}!",
 *          { "interpolation": "\uFFFD0\uFFFD" }
 *     );
 *     I18N_1 = MSG_EXTERNAL_XXX;
 * }
 * else {
 *     I18N_1 = $localize`Some message with ${'\uFFFD0\uFFFD'}!`;
 * }
 * ```
 *
 * @param message The original i18n AST message node
 * @param variable The variable that will be assigned the translation, e.g. `I18N_1`.
 * @param closureVar The variable for Closure `goog.getMsg` calls, e.g. `MSG_EXTERNAL_XXX`.
 * @param params Object mapping placeholder names to their values (e.g.
 * `{ "interpolation": "\uFFFD0\uFFFD" }`).
 * @param transformFn Optional transformation function that will be applied to the translation (e.g.
 * post-processing).
 * @returns An array of statements that defined a given translation.
 */
function getTranslationDeclStmts(
    message: i18n.Message, variable: o.ReadVarExpr, closureVar: o.ReadVarExpr,
    params: Map<string, o.Expression>,
    transformFn?: (raw: o.ReadVarExpr) => o.Expression): o.Statement[] {
  const paramsObject = Object.fromEntries(params);
  const statements: o.Statement[] = [
    declareI18nVariable(variable),
    o.ifStmt(
        createClosureModeGuard(),
        createGoogleGetMsgStatements(variable, message, closureVar, paramsObject),
        createLocalizeStatements(
            variable, message,
            formatI18nPlaceholderNamesInMap(paramsObject, /* useCamelCase */ false))),
  ];

  if (transformFn) {
    statements.push(new o.ExpressionStatement(variable.set(transformFn(variable))));
  }

  return statements;
}

/**
 * Create the expression that will be used to guard the closure mode block
 * It is equivalent to:
 *
 * ```
 * typeof ngI18nClosureMode !== undefined && ngI18nClosureMode
 * ```
 */
function createClosureModeGuard(): o.BinaryOperatorExpr {
  return o.typeofExpr(o.variable(NG_I18N_CLOSURE_MODE))
      .notIdentical(o.literal('undefined', o.STRING_TYPE))
      .and(o.variable(NG_I18N_CLOSURE_MODE));
}

/**
 * Generates vars with Closure-specific names for i18n blocks (i.e. `MSG_XXX`).
 */
function i18nGenerateClosureVar(
    pool: ConstantPool, messageId: string, fileBasedI18nSuffix: string,
    useExternalIds: boolean): o.ReadVarExpr {
  let name: string;
  const suffix = fileBasedI18nSuffix;
  if (useExternalIds) {
    const prefix = getTranslationConstPrefix(`EXTERNAL_`);
    const uniqueSuffix = pool.uniqueName(suffix);
    name = `${prefix}${sanitizeIdentifier(messageId)}$$${uniqueSuffix}`;
  } else {
    const prefix = getTranslationConstPrefix(suffix);
    name = pool.uniqueName(prefix);
  }
  return o.variable(name);
}
