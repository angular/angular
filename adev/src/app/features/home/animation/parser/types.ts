/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export type NumericValue = {
  type: 'numeric';
  values: [number, string][];
};

export type StaticValue = {
  type: 'static';
  value: string;
};

export type ColorValue = {
  type: 'color';
  value: ['rgb', number, number, number] | ['rgba', number, number, number, number];
  // red, green, blue, alpha?
};

export type TransformValue = {
  type: 'transform';
  values: Map<string, [number, string][]>; // function name, parameters in the form of a numeric data
};

/** A parsed CSS property value. */
export type CssPropertyValue = NumericValue | StaticValue | ColorValue | TransformValue;
