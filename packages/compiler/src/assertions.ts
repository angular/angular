/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const UNUSABLE_INTERPOLATION_REGEXPS = [
  /@/, // control flow reserved symbol
  /^\s*$/, // empty
  /[<>]/, // html tag
  /^[{}]$/, // i18n expansion
  /&(#|[a-z])/i, // character reference,
  /^\/\//, // comment
];

export function assertInterpolationSymbols(identifier: string, value: any): void {
  if (value != null && !(Array.isArray(value) && value.length == 2)) {
    throw new Error(`Expected '${identifier}' to be an array, [start, end].`);
  } else if (value != null) {
    const start = value[0] as string;
    const end = value[1] as string;
    // Check for unusable interpolation symbols
    UNUSABLE_INTERPOLATION_REGEXPS.forEach((regexp) => {
      if (regexp.test(start) || regexp.test(end)) {
        throw new Error(`['${start}', '${end}'] contains unusable interpolation symbol.`);
      }
    });
  }
}
