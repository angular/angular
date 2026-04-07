/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import {toPublicName} from '../../../i18n/serializers/xmb';
import * as html from '../../../ml_parser/ast';
import * as o from '../../../output/output_ast';

/** Name of the i18n attributes **/
export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';

/** Prefix of var expressions used in ICUs */
export const I18N_ICU_VAR_PREFIX = 'VAR_';

export function isI18nAttribute(name: string): boolean {
  return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}

export function hasI18nAttrs(node: html.Element | html.Component): boolean {
  return node.attrs.some((attr: html.Attribute) => isI18nAttribute(attr.name));
}

export function icuFromI18nMessage(message: i18n.Message) {
  return message.nodes[0] as i18n.IcuPlaceholder;
}

export function placeholdersToParams(placeholders: Map<string, string[]>): {
  [name: string]: o.LiteralExpr;
} {
  const params: {[name: string]: o.LiteralExpr} = {};
  placeholders.forEach((values: string[], key: string) => {
    params[key] = o.literal(values.length > 1 ? `[${values.join('|')}]` : values[0]);
  });
  return params;
}

/**
 * Format the placeholder names in a map of placeholders to expressions.
 *
 * The placeholder names are converted from "internal" format (e.g. `START_TAG_DIV_1`) to "external"
 * format (e.g. `startTagDiv_1`).
 *
 * @param params A map of placeholder names to expressions.
 * @param useCamelCase whether to camelCase the placeholder name when formatting.
 * @returns A new map of formatted placeholder names to expressions.
 */
export function formatI18nPlaceholderNamesInMap(
  params: {[name: string]: o.Expression} = {},
  useCamelCase: boolean,
) {
  const _params: {[key: string]: o.Expression} = {};
  if (params && Object.keys(params).length) {
    Object.keys(params).forEach(
      (key) => (_params[formatI18nPlaceholderName(key, useCamelCase)] = params[key]),
    );
  }
  return _params;
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
  let raw = chunks.shift()!.toLowerCase();
  if (chunks.length) {
    raw += chunks.map((c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()).join('');
  }
  return postfix ? `${raw}_${postfix}` : raw;
}
