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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleGu: NgLocale = {
  localeId: 'gu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'મધ્યરાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવારે',
          afternoon1: 'બપોરે',
          evening1: 'સાંજે',
          night1: 'રાત્રે'
        },
        narrow: {
          midnight: 'મ.રાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવારે',
          afternoon1: 'બપોરે',
          evening1: 'સાંજે',
          night1: 'રાત્રે'
        },
        wide: {
          midnight: 'મધ્યરાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવારે',
          afternoon1: 'બપોરે',
          evening1: 'સાંજે',
          night1: 'રાત્રે'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'મધ્યરાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવારે',
          afternoon1: 'બપોરે',
          evening1: 'સાંજે',
          night1: 'રાત્રે'
        },
        narrow: {
          midnight: 'મધ્યરાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવારે',
          afternoon1: 'બપોરે',
          evening1: 'સાંજે',
          night1: 'રાત્રે'
        },
        wide: {
          midnight: 'મધ્યરાત્રિ',
          am: 'AM',
          pm: 'PM',
          morning1: 'સવાર',
          afternoon1: 'બપોર',
          evening1: 'સાંજ',
          night1: 'રાત્રિ'
        }
      }
    },
    days: {
      format: {
        narrow: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'],
        short: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'],
        abbreviated: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
        wide: ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર']
      },
      standalone: {
        narrow: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'],
        short: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'],
        abbreviated: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
        wide: ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર']
      }
    },
    months: {
      format: {
        narrow: ['જા', 'ફે', 'મા', 'એ', 'મે', 'જૂ', 'જુ', 'ઑ', 'સ', 'ઑ', 'ન', 'ડિ'],
        abbreviated:
            ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
        wide: [
          'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર',
          'નવેમ્બર', 'ડિસેમ્બર'
        ]
      },
      standalone: {
        narrow: ['જા', 'ફે', 'મા', 'એ', 'મે', 'જૂ', 'જુ', 'ઑ', 'સ', 'ઑ', 'ન', 'ડિ'],
        abbreviated:
            ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
        wide: [
          'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર',
          'નવેમ્બર', 'ડિસેમ્બર'
        ]
      }
    },
    eras: {
      abbreviated: ['ઈ.સ.પૂર્વે', 'ઈ.સ.'],
      narrow: ['ઇ સ પુ', 'ઇસ'],
      wide: ['ઈસવીસન પૂર્વે', 'ઇસવીસન']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'd/M/yy'},
      time: {full: 'hh:mm:ss a zzzz', long: 'hh:mm:ss a z', medium: 'hh:mm:ss a', short: 'hh:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '20:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '20:00', to: '04:00'}
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
    formats: {
      currency: '¤#,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '[#E0]'
    }
  },
  currencySettings: {symbol: '₹', name: 'ભારતીય રૂપિયા'},
  getPluralCase: getPluralCase
};
