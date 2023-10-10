/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {type ConstantPool} from '../../../../constant_pool';
import * as i18n from '../../../../i18n/i18n_ast';
import * as o from '../../../../output/output_ast';
import {sanitizeIdentifier} from '../../../../parse_util';
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
export const TRANSLATION_VAR_PREFIX = 'i18n_';

/** Extracts i18n messages into the consts array. */
export function phaseI18nMessageExtraction(job: ComponentCompilationJob): void {
  const fileBasedI18nSuffix =
      job.relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() + '_';
  for (const unit of job.units) {
    for (const op of unit.create) {
      if ((op.kind === ir.OpKind.I18nStart || op.kind === ir.OpKind.I18n)) {
        // Only extract messages from root i18n ops, not sub-template ones.
        if (op.xref === op.root) {
          // Sort the params map to match the ordering in TemplateDefinitionBuilder.
          const params = new Map([...op.params.entries()].sort());

          const mainVar = o.variable(job.pool.uniqueName(TRANSLATION_VAR_PREFIX));
          // Closure Compiler requires const names to start with `MSG_` but disallows any other
          // const to start with `MSG_`. We define a variable starting with `MSG_` just for the
          // `goog.getMsg` call
          const closureVar = i18nGenerateClosureVar(
              job.pool, op.message.id, fileBasedI18nSuffix, job.i18nUseExternalIds);
          // TODO: figure out transformFn.
          const statements = getTranslationDeclStmts(
              op.message, mainVar, closureVar, params, undefined /*transformFn*/);
          unit.create.push(ir.createExtractedMessageOp(op.xref, mainVar, statements));
        }
      }
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
