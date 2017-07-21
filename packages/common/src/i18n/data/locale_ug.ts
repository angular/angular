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
export const NgLocaleUg: NgLocale = {
  localeId: 'ug',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'چ.ب', pm: 'چ.ك'},
        narrow: {am: 'ب', pm: 'ك'},
        wide: {am: 'چۈشتىن بۇرۇن', pm: 'چۈشتىن كېيىن'}
      },
      standalone: {
        abbreviated: {am: 'چ.ب', pm: 'چ.ك'},
        narrow: {am: 'چ.ب', pm: 'چ.ك'},
        wide: {am: 'چ.ب', pm: 'چ.ك'}
      }
    },
    days: {
      format: {
        narrow: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        short: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        abbreviated: ['يە', 'دۈ', 'سە', 'چا', 'پە', 'جۈ', 'شە'],
        wide: ['يەكشەنبە', 'دۈشەنبە', 'سەيشەنبە', 'چارشەنبە', 'پەيشەنبە', 'جۈمە', 'شەنبە']
      },
      standalone: {
        narrow: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        short: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        abbreviated: ['يە', 'دۈ', 'سە', 'چا', 'پە', 'جۈ', 'شە'],
        wide: ['يەكشەنبە', 'دۈشەنبە', 'سەيشەنبە', 'چارشەنبە', 'پەيشەنبە', 'جۈمە', 'شەنبە']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر',
          'ئۆكتەبىر', 'نويابىر', 'دېكابىر'
        ],
        wide: [
          'يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر',
          'ئۆكتەبىر', 'نويابىر', 'دېكابىر'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر',
          'ئۆكتەبىر', 'نويابىر', 'دېكابىر'
        ],
        wide: [
          'يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر',
          'ئۆكتەبىر', 'نويابىر', 'دېكابىر'
        ]
      }
    },
    eras: {
      abbreviated: ['BCE', 'مىلادىيە'],
      narrow: ['BCE', 'مىلادىيە'],
      wide: ['مىلادىيەدىن بۇرۇن', 'مىلادىيە']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y d-MMMM، EEEE', long: 'd-MMMM، y', medium: 'd-MMM، y', short: 'y-MM-dd'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1}، {0}', short: '{1}، {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '￥', name: 'جۇڭگو يۈەنى'},
  getPluralCase: getPluralCase
};
