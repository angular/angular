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
export const NgLocaleCkbIR: NgLocale = {
  localeId: 'ckb-IR',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ب.ن', pm: 'د.ن'},
        narrow: {am: 'ب.ن', pm: 'د.ن'},
        wide: {am: 'ب.ن', pm: 'د.ن'}
      },
      standalone: {
        abbreviated: {am: 'ب.ن', pm: 'د.ن'},
        narrow: {am: 'ب.ن', pm: 'د.ن'},
        wide: {am: 'ب.ن', pm: 'د.ن'}
      }
    },
    days: {
      format: {
        narrow: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
        short: ['١ش', '٢ش', '٣ش', '٤ش', '٥ش', 'ھ', 'ش'],
        abbreviated:
            ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
        wide: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە']
      },
      standalone: {
        narrow: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
        short: ['١ش', '٢ش', '٣ش', '٤ش', '٥ش', 'ھ', 'ش'],
        abbreviated:
            ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
        wide: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە']
      }
    },
    months: {
      format: {
        narrow: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
        abbreviated: [
          'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب',
          'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ],
        wide: [
          'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب',
          'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ]
      },
      standalone: {
        narrow: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
        abbreviated: [
          'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب',
          'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ],
        wide: [
          'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب',
          'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ]
      }
    },
    eras: {
      abbreviated: ['پێش زایین', 'زایینی'],
      narrow: ['پێش زایین', 'زایینی'],
      wide: ['پێش زایین', 'زایینی']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 5],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'dی MMMMی y', medium: 'y MMM d', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'IRR', name: 'IRR'},
  getPluralCase: getPluralCase
};
