/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '@angular/core';

import {isArray, isBlank, isPresent, isString} from '../src/facade/lang';

export function assertArrayOfStrings(identifier: string, value: any) {
  if (!isDevMode() || isBlank(value)) {
    return;
  }
  if (!isArray(value)) {
    throw new Error(`Expected '${identifier}' to be an array of strings.`);
  }
  for (var i = 0; i < value.length; i += 1) {
    if (!isString(value[i])) {
      throw new Error(`Expected '${identifier}' to be an array of strings.`);
    }
  }
}

const INTERPOLATION_BLACKLIST_REGEXPS = [
  /^\s*$/,        // empty
  /[<>]/,         // html tag
  /^[{}]$/,       // i18n expansion
  /&(#|[a-z])/i,  // character reference,
  /^\/\//,        // comment
];

export function assertInterpolationSymbols(identifier: string, value: any): void {
  if (isPresent(value) && !(isArray(value) && value.length == 2)) {
    throw new Error(`Expected '${identifier}' to be an array, [start, end].`);
  } else if (isDevMode() && !isBlank(value)) {
    const start = value[0] as string;
    const end = value[1] as string;
    // black list checking
    INTERPOLATION_BLACKLIST_REGEXPS.forEach(regexp => {
      if (regexp.test(start) || regexp.test(end)) {
        throw new Error(`['${start}', '${end}'] contains unusable interpolation symbol.`);
      }
    });
  }
}
