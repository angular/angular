/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CssPropertyValue} from './types';

/**
 * Convert a parsed CSS property value to its string representation.
 *
 * @param value Parsed CSS property value
 * @returns String CSS property value
 */
export function stringifyParsedValue(value: CssPropertyValue): string {
  switch (value.type) {
    case 'numeric':
      return value.values.map(([num, unit]) => num + unit).join(' ');
    case 'transform':
      return Array.from(value.values)
        .map(
          ([fnName, numData]) =>
            `${fnName}(${numData.map(([num, unit]) => num + unit).join(', ')})`,
        )
        .join(' ');
    case 'color':
      const v = value.value;
      let color = v[0] + '(';
      for (let i = 1; i < v.length; i++) {
        color += v[i] + (i < v.length - 1 ? ', ' : '');
      }
      return color + ')';
    case 'static':
      return value.value;
  }
}

/**
 * Creates a deep copy of a parsed CSS property value.
 *
 * @param value Value to be copied
 * @returns Copied value
 */
export function copyParsedValue<T = CssPropertyValue>(value: T): T {
  return structuredClone(value);
}
