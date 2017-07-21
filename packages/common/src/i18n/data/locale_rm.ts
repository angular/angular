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
export const NgLocaleRm: NgLocale = {
  localeId: 'rm',
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
        narrow: ['D', 'G', 'M', 'M', 'G', 'V', 'S'],
        short: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
        abbreviated: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
        wide: ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda']
      },
      standalone: {
        narrow: ['D', 'G', 'M', 'M', 'G', 'V', 'S'],
        short: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
        abbreviated: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
        wide: ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda']
      }
    },
    months: {
      format: {
        narrow: ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.',
          'nov.', 'dec.'
        ],
        wide: [
          'schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust',
          'settember', 'october', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.',
          'nov.', 'dec.'
        ],
        wide: [
          'schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust',
          'settember', 'october', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['av. Cr.', 's. Cr.'],
      narrow: ['av. Cr.', 's. Cr.'],
      wide: ['avant Cristus', 'suenter Cristus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, \'ils\' d \'da\' MMMM y',
        long: 'd \'da\' MMMM y',
        medium: 'dd-MM-y',
        short: 'dd-MM-yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: '’',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'CHF', name: 'franc svizzer'},
  getPluralCase: getPluralCase
};
