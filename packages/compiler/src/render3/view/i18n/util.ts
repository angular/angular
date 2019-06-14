/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../i18n/i18n_ast';
import {toPublicName} from '../../../i18n/serializers/xmb';
import * as html from '../../../ml_parser/ast';
import {mapLiteral} from '../../../output/map_util';
import * as o from '../../../output/output_ast';
import {Identifiers as R3} from '../../r3_identifiers';


/* Closure variables holding messages must be named `MSG_[A-Z0-9]+` */
const CLOSURE_TRANSLATION_PREFIX = 'MSG_';

/* Prefix for non-`goog.getMsg` i18n-related vars */
export const TRANSLATION_PREFIX = 'I18N_';

/** Closure uses `goog.getMsg(message)` to lookup translations */
const GOOG_GET_MSG = 'goog.getMsg';

/** Name of the global variable that is used to determine if we use Closure translations or not */
const NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';

/** I18n separators for metadata **/
const I18N_MEANING_SEPARATOR = '|';
const I18N_ID_SEPARATOR = '@@';

/** Name of the i18n attributes **/
export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';

/** Prefix of var expressions used in ICUs */
export const I18N_ICU_VAR_PREFIX = 'VAR_';

/** Prefix of ICU expressions for post processing */
export const I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';

/** Placeholder wrapper for i18n expressions **/
export const I18N_PLACEHOLDER_SYMBOL = '�';

export type I18nMeta = {
  id?: string,
  description?: string,
  meaning?: string
};

function i18nTranslationToDeclStmt(
    variable: o.ReadVarExpr, closureVar: o.ReadVarExpr, message: string, meta: I18nMeta,
    params?: {[name: string]: o.Expression}): o.Statement[] {
  const statements: o.Statement[] = [];
  // var I18N_X;
  statements.push(
      new o.DeclareVarStmt(variable.name !, undefined, o.INFERRED_TYPE, null, variable.sourceSpan));

  const args = [o.literal(message) as o.Expression];
  if (params && Object.keys(params).length) {
    args.push(mapLiteral(params, true));
  }

  // Closure JSDoc comments
  const docStatements = i18nMetaToDocStmt(meta);
  const thenStatements: o.Statement[] = docStatements ? [docStatements] : [];
  const googFnCall = o.variable(GOOG_GET_MSG).callFn(args);
  // const MSG_... = goog.getMsg(..);
  thenStatements.push(closureVar.set(googFnCall).toConstDecl());
  // I18N_X = MSG_...;
  thenStatements.push(new o.ExpressionStatement(variable.set(closureVar)));
  const localizeFnCall = o.importExpr(R3.i18nLocalize).callFn(args);
  // I18N_X = i18nLocalize(...);
  const elseStatements = [new o.ExpressionStatement(variable.set(localizeFnCall))];
  // if(ngI18nClosureMode) { ... } else { ... }
  statements.push(o.ifStmt(o.variable(NG_I18N_CLOSURE_MODE), thenStatements, elseStatements));

  return statements;
}

// Converts i18n meta information for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
function i18nMetaToDocStmt(meta: I18nMeta): o.JSDocCommentStmt|null {
  const tags: o.JSDocTag[] = [];
  if (meta.description) {
    tags.push({tagName: o.JSDocTagName.Desc, text: meta.description});
  }
  if (meta.meaning) {
    tags.push({tagName: o.JSDocTagName.Meaning, text: meta.meaning});
  }
  return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
}

export function isI18nAttribute(name: string): boolean {
  return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}

export function isI18nRootNode(meta?: i18n.AST): meta is i18n.Message {
  return meta instanceof i18n.Message;
}

export function isSingleI18nIcu(meta?: i18n.AST): boolean {
  return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
}

export function hasI18nAttrs(element: html.Element): boolean {
  return element.attrs.some((attr: html.Attribute) => isI18nAttribute(attr.name));
}

export function metaFromI18nMessage(message: i18n.Message, id: string | null = null): I18nMeta {
  return {
    id: typeof id === 'string' ? id : message.id || '',
    meaning: message.meaning || '',
    description: message.description || ''
  };
}

export function icuFromI18nMessage(message: i18n.Message) {
  return message.nodes[0] as i18n.IcuPlaceholder;
}

export function wrapI18nPlaceholder(content: string | number, contextId: number = 0): string {
  const blockId = contextId > 0 ? `:${contextId}` : '';
  return `${I18N_PLACEHOLDER_SYMBOL}${content}${blockId}${I18N_PLACEHOLDER_SYMBOL}`;
}

export function assembleI18nBoundString(
    strings: string[], bindingStartIndex: number = 0, contextId: number = 0): string {
  if (!strings.length) return '';
  let acc = '';
  const lastIdx = strings.length - 1;
  for (let i = 0; i < lastIdx; i++) {
    acc += `${strings[i]}${wrapI18nPlaceholder(bindingStartIndex + i, contextId)}`;
  }
  acc += strings[lastIdx];
  return acc;
}

export function getSeqNumberGenerator(startsAt: number = 0): () => number {
  let current = startsAt;
  return () => current++;
}

export function placeholdersToParams(placeholders: Map<string, string[]>):
    {[name: string]: o.Expression} {
  const params: {[name: string]: o.Expression} = {};
  placeholders.forEach((values: string[], key: string) => {
    params[key] = o.literal(values.length > 1 ? `[${values.join('|')}]` : values[0]);
  });
  return params;
}

export function updatePlaceholderMap(map: Map<string, any[]>, name: string, ...values: any[]) {
  const current = map.get(name) || [];
  current.push(...values);
  map.set(name, current);
}

export function assembleBoundTextPlaceholders(
    meta: i18n.AST, bindingStartIndex: number = 0, contextId: number = 0): Map<string, any[]> {
  const startIdx = bindingStartIndex;
  const placeholders = new Map<string, any>();
  const node =
      meta instanceof i18n.Message ? meta.nodes.find(node => node instanceof i18n.Container) : meta;
  if (node) {
    (node as i18n.Container)
        .children
        .filter((child: i18n.Node): child is i18n.Placeholder => child instanceof i18n.Placeholder)
        .forEach((child: i18n.Placeholder, idx: number) => {
          const content = wrapI18nPlaceholder(startIdx + idx, contextId);
          updatePlaceholderMap(placeholders, child.name, content);
        });
  }
  return placeholders;
}

export function findIndex(items: any[], callback: (item: any) => boolean): number {
  for (let i = 0; i < items.length; i++) {
    if (callback(items[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Parses i18n metas like:
 *  - "@@id",
 *  - "description[@@id]",
 *  - "meaning|description[@@id]"
 * and returns an object with parsed output.
 *
 * @param meta String that represents i18n meta
 * @returns Object with id, meaning and description fields
 */
export function parseI18nMeta(meta?: string): I18nMeta {
  let id: string|undefined;
  let meaning: string|undefined;
  let description: string|undefined;

  if (meta) {
    const idIndex = meta.indexOf(I18N_ID_SEPARATOR);
    const descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, id] =
        (idIndex > -1) ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {id, meaning, description};
}

/**
 * Converts internal placeholder names to public-facing format
 * (for example to use in goog.getMsg call).
 * Example: `START_TAG_DIV_1` is converted to `startTagDiv_1`.
 *
 * @param name The placeholder name that should be formatted
 * @returns Formatted placeholder name
 */
export function formatI18nPlaceholderName(name: string, useCamelCase: boolean = true): string {
  const publicName = toPublicName(name);
  if (!useCamelCase) {
    return publicName;
  }
  const chunks = publicName.split('_');
  if (chunks.length === 1) {
    // if no "_" found - just lowercase the value
    return name.toLowerCase();
  }
  let postfix;
  // eject last element if it's a number
  if (/^\d+$/.test(chunks[chunks.length - 1])) {
    postfix = chunks.pop();
  }
  let raw = chunks.shift() !.toLowerCase();
  if (chunks.length) {
    raw += chunks.map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()).join('');
  }
  return postfix ? `${raw}_${postfix}` : raw;
}

/**
 * Generates a prefix for translation const name.
 *
 * @param extra Additional local prefix that should be injected into translation var name
 * @returns Complete translation const prefix
 */
export function getTranslationConstPrefix(extra: string): string {
  return `${CLOSURE_TRANSLATION_PREFIX}${extra}`.toUpperCase();
}

/**
 * Generates translation declaration statements.
 *
 * @param variable Translation value reference
 * @param closureVar Variable for Closure `goog.getMsg` calls
 * @param message Text message to be translated
 * @param meta Object that contains meta information (id, meaning and description)
 * @param params Object with placeholders key-value pairs
 * @param transformFn Optional transformation (post processing) function reference
 * @returns Array of Statements that represent a given translation
 */
export function getTranslationDeclStmts(
    variable: o.ReadVarExpr, closureVar: o.ReadVarExpr, message: string, meta: I18nMeta,
    params: {[name: string]: o.Expression} = {},
    transformFn?: (raw: o.ReadVarExpr) => o.Expression): o.Statement[] {
  const statements: o.Statement[] = [];

  statements.push(...i18nTranslationToDeclStmt(variable, closureVar, message, meta, params));

  if (transformFn) {
    statements.push(new o.ExpressionStatement(variable.set(transformFn(variable))));
  }

  return statements;
}
