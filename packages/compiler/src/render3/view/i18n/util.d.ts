/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import * as html from '../../../ml_parser/ast';
import * as o from '../../../output/output_ast';
/** Name of the i18n attributes **/
export declare const I18N_ATTR = "i18n";
export declare const I18N_ATTR_PREFIX = "i18n-";
/** Prefix of var expressions used in ICUs */
export declare const I18N_ICU_VAR_PREFIX = "VAR_";
export declare function isI18nAttribute(name: string): boolean;
export declare function hasI18nAttrs(node: html.Element | html.Component): boolean;
export declare function icuFromI18nMessage(message: i18n.Message): i18n.IcuPlaceholder;
export declare function placeholdersToParams(placeholders: Map<string, string[]>): {
    [name: string]: o.LiteralExpr;
};
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
export declare function formatI18nPlaceholderNamesInMap(params: {
    [name: string]: o.Expression;
} | undefined, useCamelCase: boolean): {
    [key: string]: o.Expression;
};
/**
 * Converts internal placeholder names to public-facing format
 * (for example to use in goog.getMsg call).
 * Example: `START_TAG_DIV_1` is converted to `startTagDiv_1`.
 *
 * @param name The placeholder name that should be formatted
 * @returns Formatted placeholder name
 */
export declare function formatI18nPlaceholderName(name: string, useCamelCase?: boolean): string;
