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
export const NgLocaleKs: NgLocale = {
  localeId: 'ks',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['ا', 'ژ', 'ب', 'ب', 'ب', 'ج', 'ب'],
        short: ['آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار'],
        abbreviated: ['آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار'],
        wide: ['اَتھوار', 'ژٔنٛدرٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار']
      },
      standalone: {
        narrow: ['ا', 'ژ', 'ب', 'ب', 'ب', 'ج', 'ب'],
        short: ['آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار'],
        abbreviated: ['آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار'],
        wide: ['اَتھوار', 'ژٔنٛدرٕروار', 'بوٚموار', 'بودوار', 'برٛٮ۪سوار', 'جُمہ', 'بٹوار']
      }
    },
    months: {
      format: {
        narrow: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'س', 'ا', 'ن'],
        abbreviated: [
          'جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر',
          'نومبر', 'دسمبر'
        ]
      },
      standalone: {
        narrow: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'س', 'ا', 'ن'],
        abbreviated: [
          'جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر',
          'نومبر', 'دسمبر'
        ]
      }
    },
    eras: {
      abbreviated: ['بی سی', 'اے ڈی'],
      narrow: ['بی سی', 'اے ڈی'],
      wide: ['قبٕل مسیٖح', 'عیٖسوی سنہٕ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'M/d/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
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
      minusSign: '‎-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {
      currency: '¤ #,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₹', name: 'ہِندُستٲنۍ رۄپَے'},
  getPluralCase: getPluralCase
};
