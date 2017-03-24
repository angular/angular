/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, LOCALE_ID} from '@angular/core';

/**
 * @experimental
 */
export abstract class NgLocalization { abstract getPluralCategory(value: any): string; }


/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 *
 * @internal
 */
export function getPluralCategory(
    value: number, cases: string[], ngLocalization: NgLocalization): string {
  let key = `=${value}`;

  if (cases.indexOf(key) > -1) {
    return key;
  }

  key = ngLocalization.getPluralCategory(value);

  if (cases.indexOf(key) > -1) {
    return key;
  }

  if (cases.indexOf('other') > -1) {
    return 'other';
  }

  throw new Error(`No plural message found for value "${value}"`);
}

/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
@Injectable()
export class NgLocaleLocalization extends NgLocalization {
  constructor(@Inject(LOCALE_ID) protected locale: string) { super(); }

  getPluralCategory(value: any): string {
    const plural = getPluralCase(this.locale, value);

    switch (plural) {
      case Plural.Zero:
        return 'zero';
      case Plural.One:
        return 'one';
      case Plural.Two:
        return 'two';
      case Plural.Few:
        return 'few';
      case Plural.Many:
        return 'many';
      default:
        return 'other';
    }
  }
}

// This is generated code DO NOT MODIFY
// see angular/script/cldr/gen_plural_rules.js

/** @experimental */
export enum Plural {
  Zero,
  One,
  Two,
  Few,
  Many,
  Other,
}

/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
export function getPluralCase(locale: string, nLike: number | string): Plural {
  // TODO(vicb): lazy compute
  if (typeof nLike === 'string') {
    nLike = parseInt(<string>nLike, 10);
  }
  const n: number = nLike as number;
  const nDecimal = n.toString().replace(/^[^.]*\.?/, '');
  const i = Math.floor(Math.abs(n));
  const v = nDecimal.length;
  const f = parseInt(nDecimal, 10);
  const t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;

  const lang = locale.split('-')[0].toLowerCase();

  switch (lang) {
    case 'af':
    case 'asa':
    case 'az':
    case 'bem':
    case 'bez':
    case 'bg':
    case 'brx':
    case 'ce':
    case 'cgg':
    case 'chr':
    case 'ckb':
    case 'ee':
    case 'el':
    case 'eo':
    case 'es':
    case 'eu':
    case 'fo':
    case 'fur':
    case 'gsw':
    case 'ha':
    case 'haw':
    case 'hu':
    case 'jgo':
    case 'jmc':
    case 'ka':
    case 'kk':
    case 'kkj':
    case 'kl':
    case 'ks':
    case 'ksb':
    case 'ky':
    case 'lb':
    case 'lg':
    case 'mas':
    case 'mgo':
    case 'ml':
    case 'mn':
    case 'nb':
    case 'nd':
    case 'ne':
    case 'nn':
    case 'nnh':
    case 'nyn':
    case 'om':
    case 'or':
    case 'os':
    case 'ps':
    case 'rm':
    case 'rof':
    case 'rwk':
    case 'saq':
    case 'seh':
    case 'sn':
    case 'so':
    case 'sq':
    case 'ta':
    case 'te':
    case 'teo':
    case 'tk':
    case 'tr':
    case 'ug':
    case 'uz':
    case 'vo':
    case 'vun':
    case 'wae':
    case 'xog':
      if (n === 1) return Plural.One;
      return Plural.Other;
    case 'agq':
    case 'bas':
    case 'cu':
    case 'dav':
    case 'dje':
    case 'dua':
    case 'dyo':
    case 'ebu':
    case 'ewo':
    case 'guz':
    case 'kam':
    case 'khq':
    case 'ki':
    case 'kln':
    case 'kok':
    case 'ksf':
    case 'lrc':
    case 'lu':
    case 'luo':
    case 'luy':
    case 'mer':
    case 'mfe':
    case 'mgh':
    case 'mua':
    case 'mzn':
    case 'nmg':
    case 'nus':
    case 'qu':
    case 'rn':
    case 'rw':
    case 'sbp':
    case 'twq':
    case 'vai':
    case 'yav':
    case 'yue':
    case 'zgh':
    case 'ak':
    case 'ln':
    case 'mg':
    case 'pa':
    case 'ti':
      if (n === Math.floor(n) && n >= 0 && n <= 1) return Plural.One;
      return Plural.Other;
    case 'am':
    case 'as':
    case 'bn':
    case 'fa':
    case 'gu':
    case 'hi':
    case 'kn':
    case 'mr':
    case 'zu':
      if (i === 0 || n === 1) return Plural.One;
      return Plural.Other;
    case 'ar':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return Plural.Few;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return Plural.Many;
      return Plural.Other;
    case 'ast':
    case 'ca':
    case 'de':
    case 'en':
    case 'et':
    case 'fi':
    case 'fy':
    case 'gl':
    case 'it':
    case 'nl':
    case 'sv':
    case 'sw':
    case 'ur':
    case 'yi':
      if (i === 1 && v === 0) return Plural.One;
      return Plural.Other;
    case 'be':
      if (n % 10 === 1 && !(n % 100 === 11)) return Plural.One;
      if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
          !(n % 100 >= 12 && n % 100 <= 14))
        return Plural.Few;
      if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
          n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'br':
      if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91)) return Plural.One;
      if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92)) return Plural.Two;
      if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) &&
          !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 ||
            n % 100 >= 90 && n % 100 <= 99))
        return Plural.Few;
      if (!(n === 0) && n % 1e6 === 0) return Plural.Many;
      return Plural.Other;
    case 'bs':
    case 'hr':
    case 'sr':
      if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
        return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
              !(i % 100 >= 12 && i % 100 <= 14) ||
          f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
              !(f % 100 >= 12 && f % 100 <= 14))
        return Plural.Few;
      return Plural.Other;
    case 'cs':
    case 'sk':
      if (i === 1 && v === 0) return Plural.One;
      if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return Plural.Few;
      if (!(v === 0)) return Plural.Many;
      return Plural.Other;
    case 'cy':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n === 3) return Plural.Few;
      if (n === 6) return Plural.Many;
      return Plural.Other;
    case 'da':
      if (n === 1 || !(t === 0) && (i === 0 || i === 1)) return Plural.One;
      return Plural.Other;
    case 'dsb':
    case 'hsb':
      if (v === 0 && i % 100 === 1 || f % 100 === 1) return Plural.One;
      if (v === 0 && i % 100 === 2 || f % 100 === 2) return Plural.Two;
      if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 ||
          f % 100 === Math.floor(f % 100) && f % 100 >= 3 && f % 100 <= 4)
        return Plural.Few;
      return Plural.Other;
    case 'ff':
    case 'fr':
    case 'hy':
    case 'kab':
      if (i === 0 || i === 1) return Plural.One;
      return Plural.Other;
    case 'fil':
      if (v === 0 && (i === 1 || i === 2 || i === 3) ||
          v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) ||
          !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
        return Plural.One;
      return Plural.Other;
    case 'ga':
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n === Math.floor(n) && n >= 3 && n <= 6) return Plural.Few;
      if (n === Math.floor(n) && n >= 7 && n <= 10) return Plural.Many;
      return Plural.Other;
    case 'gd':
      if (n === 1 || n === 11) return Plural.One;
      if (n === 2 || n === 12) return Plural.Two;
      if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19)) return Plural.Few;
      return Plural.Other;
    case 'gv':
      if (v === 0 && i % 10 === 1) return Plural.One;
      if (v === 0 && i % 10 === 2) return Plural.Two;
      if (v === 0 &&
          (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
        return Plural.Few;
      if (!(v === 0)) return Plural.Many;
      return Plural.Other;
    case 'he':
      if (i === 1 && v === 0) return Plural.One;
      if (i === 2 && v === 0) return Plural.Two;
      if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0) return Plural.Many;
      return Plural.Other;
    case 'is':
      if (t === 0 && i % 10 === 1 && !(i % 100 === 11) || !(t === 0)) return Plural.One;
      return Plural.Other;
    case 'ksh':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      return Plural.Other;
    case 'kw':
    case 'naq':
    case 'se':
    case 'smn':
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      return Plural.Other;
    case 'lag':
      if (n === 0) return Plural.Zero;
      if ((i === 0 || i === 1) && !(n === 0)) return Plural.One;
      return Plural.Other;
    case 'lt':
      if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19)) return Plural.One;
      if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 &&
          !(n % 100 >= 11 && n % 100 <= 19))
        return Plural.Few;
      if (!(f === 0)) return Plural.Many;
      return Plural.Other;
    case 'lv':
    case 'prg':
      if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
          v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
        return Plural.Zero;
      if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
          !(v === 2) && f % 10 === 1)
        return Plural.One;
      return Plural.Other;
    case 'mk':
      if (v === 0 && i % 10 === 1 || f % 10 === 1) return Plural.One;
      return Plural.Other;
    case 'mt':
      if (n === 1) return Plural.One;
      if (n === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 2 && n % 100 <= 10)
        return Plural.Few;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19) return Plural.Many;
      return Plural.Other;
    case 'pl':
      if (i === 1 && v === 0) return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14))
        return Plural.Few;
      if (v === 0 && !(i === 1) && i % 10 === Math.floor(i % 10) && i % 10 >= 0 && i % 10 <= 1 ||
          v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
          v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 12 && i % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'pt':
      if (n === Math.floor(n) && n >= 0 && n <= 2 && !(n === 2)) return Plural.One;
      return Plural.Other;
    case 'ro':
      if (i === 1 && v === 0) return Plural.One;
      if (!(v === 0) || n === 0 ||
          !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
        return Plural.Few;
      return Plural.Other;
    case 'ru':
    case 'uk':
      if (v === 0 && i % 10 === 1 && !(i % 100 === 11)) return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14))
        return Plural.Few;
      if (v === 0 && i % 10 === 0 ||
          v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
          v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 11 && i % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'shi':
      if (i === 0 || n === 1) return Plural.One;
      if (n === Math.floor(n) && n >= 2 && n <= 10) return Plural.Few;
      return Plural.Other;
    case 'si':
      if (n === 0 || n === 1 || i === 0 && f === 1) return Plural.One;
      return Plural.Other;
    case 'sl':
      if (v === 0 && i % 100 === 1) return Plural.One;
      if (v === 0 && i % 100 === 2) return Plural.Two;
      if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
        return Plural.Few;
      return Plural.Other;
    case 'tzm':
      if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
        return Plural.One;
      return Plural.Other;
    default:
      return Plural.Other;
  }
}
