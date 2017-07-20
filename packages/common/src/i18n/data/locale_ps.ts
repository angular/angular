/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This is generated code DO NOT MODIFY
// see angular/tools/gulp-tasks/cldr/extract.js

import {NgLocale, Plural} from '@angular/core';

/** @experimental */
export function getPluralCase(n: number): Plural {
  if (n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocalePs: NgLocale = {
  localeId: 'ps',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'غ.م.', pm: 'غ.و.'},
        narrow: {am: 'غ.م.', pm: 'غ.و.'},
        wide: {am: 'غ.م.', pm: 'غ.و.'}
      },
      standalone: {
        abbreviated: {am: 'غ.م.', pm: 'غ.و.'},
        narrow: {am: 'غ.م.', pm: 'غ.و.'},
        wide: {am: 'غ.م.', pm: 'غ.و.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        abbreviated: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        abbreviated: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اګست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اګست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اګست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اګست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      }
    },
    eras: {
      abbreviated: ['له میلاد وړاندې', 'م.'],
      narrow: ['له میلاد وړاندې', 'م.'],
      wide: ['له میلاد څخه وړاندې', 'له میلاد څخه وروسته']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [4, 5],
    formats: {
      date: {full: 'EEEE د y د MMMM d', long: 'د y د MMMM d', medium: 'y MMM d', short: 'y/M/d'},
      time: {full: 'H:mm:ss (zzzz)', long: 'H:mm:ss (z)', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '‎−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '؋', name: 'افغانۍ'},
  getPluralCase: getPluralCase
};
