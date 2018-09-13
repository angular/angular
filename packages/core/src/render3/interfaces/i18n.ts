/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IcuExpression} from './icu';

/**
 * Represents the instructions used to translate the template.
 * Instructions can be a placeholder index, a static text, an ICU instruction or a simple bit field
 * (`I18nInstructions`).
 * When the instruction is the flag `Text`, it is always followed by its text value.
 */
export type I18nInstruction = number | string | IcuExpression;
/**
 * Represents the instructions used to translate attributes containing bindings and ICU expressions.
 * Even indexes contain static strings, while odd indexes contain either the index of the binding
 * whose value will be concatenated into the final translation or an ICU expression.
 */
export type I18nAttrInstruction = number | string | IcuExpression;
/** Mapping of placeholder names to their absolute indexes in their templates. */
export type PlaceholderMap = {
  [name: string]: number
};
