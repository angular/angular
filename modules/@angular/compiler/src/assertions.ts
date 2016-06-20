import {isDevMode} from '@angular/core';

import {BaseException} from '../src/facade/exceptions';
import {isArray, isBlank, isString} from '../src/facade/lang';

export function assertArrayOfStrings(identifier: string, value: any) {
  if (!isDevMode() || isBlank(value)) {
    return;
  }
  if (!isArray(value)) {
    throw new BaseException(`Expected '${identifier}' to be an array of strings.`);
  }
  for (var i = 0; i < value.length; i += 1) {
    if (!isString(value[i])) {
      throw new BaseException(`Expected '${identifier}' to be an array of strings.`);
    }
  }
}

const INTERPOLATION_BLACKLIST_REGEXPS = [
  /^\s*$/g,     // empty
  /[<>]/g,      // html tag
  /^[\{\}]$/g,  // i18n expansion
];

export function assertInterpolationSymbols(identifier: string, value: any): void {
  if (isDevMode() && !isBlank(value) && (!isArray(value) || value.length != 2)) {
    throw new BaseException(`Expected '${identifier}' to be an array, [start, end].`);
  } else if (isDevMode() && !isBlank(value)) {
    const start = value[0] as string;
    const end = value[1] as string;
    // black list checking
    INTERPOLATION_BLACKLIST_REGEXPS.forEach(regexp => {
      if (regexp.test(start) || regexp.test(end)) {
        throw new BaseException(`['${start}', '${end}'] contains unusable interpolation symbol.`);
      }
    });
  }
}
