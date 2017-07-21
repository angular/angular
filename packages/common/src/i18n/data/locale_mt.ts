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
  if (n === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 2 && n % 100 <= 10)
    return Plural.Few;
  if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleMt: NgLocale = {
  localeId: 'mt',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['Ħd', 'T', 'Tl', 'Er', 'Ħm', 'Ġm', 'Sb'],
        short: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
        abbreviated: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
        wide: ['Il-Ħadd', 'It-Tnejn', 'It-Tlieta', 'L-Erbgħa', 'Il-Ħamis', 'Il-Ġimgħa', 'Is-Sibt']
      },
      standalone: {
        narrow: ['Ħd', 'Tn', 'Tl', 'Er', 'Ħm', 'Ġm', 'Sb'],
        short: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
        abbreviated: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
        wide:
            ['Il-Ħadd', 'It-Tnejn', 'It-Tlieta', 'L-Erbgħa', 'Il-Ħamis', 'Il-Ġimgħa', 'Is-Sibt']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'Ġ', 'L', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Fra', 'Mar', 'Apr', 'Mej', 'Ġun', 'Lul', 'Aww', 'Set', 'Ott', 'Nov', 'Diċ'],
        wide: [
          'Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju', 'Awwissu', 'Settembru',
          'Ottubru', 'Novembru', 'Diċembru'
        ]
      },
      standalone: {
        narrow: ['Jn', 'Fr', 'Mz', 'Ap', 'Mj', 'Ġn', 'Lj', 'Aw', 'St', 'Ob', 'Nv', 'Dċ'],
        abbreviated:
            ['Jan', 'Fra', 'Mar', 'Apr', 'Mej', 'Ġun', 'Lul', 'Aww', 'Set', 'Ott', 'Nov', 'Diċ'],
        wide: [
          'Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju', 'Awwissu', 'Settembru',
          'Ottubru', 'Novembru', 'Diċembru'
        ]
      }
    },
    eras: {abbreviated: ['QK', 'WK'], narrow: ['QK', 'WK'], wide: ['Qabel Kristu', 'Wara Kristu']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d \'ta\'’ MMMM y',
        long: 'd \'ta\'’ MMMM y',
        medium: 'dd MMM y',
        short: 'dd/MM/y'
      },
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
  currencySettings: {symbol: '€', name: 'ewro'},
  getPluralCase: getPluralCase
};
