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
export const NgLocaleZu: NgLocale = {
  localeId: 'zu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'AM',
          pm: 'PM',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        },
        narrow: {
          am: 'a',
          pm: 'p',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        },
        wide: {
          am: 'AM',
          pm: 'PM',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        }
      },
      standalone: {
        abbreviated: {
          am: 'AM',
          pm: 'PM',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        },
        narrow: {
          am: 'a',
          pm: 'p',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        },
        wide: {
          am: 'AM',
          pm: 'PM',
          morning1: 'entathakusa',
          morning2: 'ekuseni',
          afternoon1: 'emini',
          evening1: 'ntambama',
          night1: 'ebusuku'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'B', 'T', 'S', 'H', 'M'],
        short: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
        abbreviated: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
        wide: [
          'ISonto', 'UMsombuluko', 'ULwesibili', 'ULwesithathu', 'ULwesine', 'ULwesihlanu',
          'UMgqibelo'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'B', 'T', 'S', 'H', 'M'],
        short: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
        abbreviated: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
        wide: [
          'ISonto', 'UMsombuluko', 'ULwesibili', 'ULwesithathu', 'ULwesine', 'ULwesihlanu',
          'UMgqibelo'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'UMasingana', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti',
          'Septhemba', 'Okthoba', 'Novemba', 'Disemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'Januwari', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti',
          'Septhemba', 'Okthoba', 'Novemba', 'Disemba'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['BC', 'AD'], wide: ['BC', 'AD']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'M/d/yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '10:00', to: '13:00'},
      evening1: {from: '13:00', to: '19:00'},
      morning1: {from: '00:00', to: '06:00'},
      morning2: {from: '06:00', to: '10:00'},
      night1: {from: '19:00', to: '24:00'}
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
  currencySettings: {symbol: 'R', name: 'i-South African Rand'},
  getPluralCase: getPluralCase
};
