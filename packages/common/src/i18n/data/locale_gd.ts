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
  if (n === 1 || n === 11) return Plural.One;
  if (n === 2 || n === 12) return Plural.Two;
  if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19)) return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleGd: NgLocale = {
  localeId: 'gd',
  dateTimeTranslations: {
    dayPeriods: {
      format:
          {abbreviated: {am: 'm', pm: 'f'}, narrow: {am: 'm', pm: 'f'}, wide: {am: 'm', pm: 'f'}},
      standalone:
          {abbreviated: {am: 'm', pm: 'f'}, narrow: {am: 'm', pm: 'f'}, wide: {am: 'm', pm: 'f'}}
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'C', 'A', 'H', 'S'],
        short: ['Dò', 'Lu', 'Mà', 'Ci', 'Da', 'hA', 'Sa'],
        abbreviated: ['DiD', 'DiL', 'DiM', 'DiC', 'Dia', 'Dih', 'DiS'],
        wide: [
          'DiDòmhnaich', 'DiLuain', 'DiMàirt', 'DiCiadain', 'DiarDaoin', 'DihAoine', 'DiSathairne'
        ]
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'C', 'A', 'H', 'S'],
        short: ['Dò', 'Lu', 'Mà', 'Ci', 'Da', 'hA', 'Sa'],
        abbreviated: ['DiD', 'DiL', 'DiM', 'DiC', 'Dia', 'Dih', 'DiS'],
        wide: [
          'DiDòmhnaich', 'DiLuain', 'DiMàirt', 'DiCiadain', 'DiarDaoin', 'DihAoine', 'DiSathairne'
        ]
      }
    },
    months: {
      format: {
        narrow: ['F', 'G', 'M', 'G', 'C', 'Ò', 'I', 'L', 'S', 'D', 'S', 'D'],
        abbreviated: [
          'Faoi', 'Gearr', 'Màrt', 'Gibl', 'Cèit', 'Ògmh', 'Iuch', 'Lùna', 'Sult', 'Dàmh', 'Samh',
          'Dùbh'
        ],
        wide: [
          'dhen Fhaoilleach', 'dhen Ghearran', 'dhen Mhàrt', 'dhen Ghiblean', 'dhen Chèitean',
          'dhen Ògmhios', 'dhen Iuchar', 'dhen Lùnastal', 'dhen t-Sultain', 'dhen Dàmhair',
          'dhen t-Samhain', 'dhen Dùbhlachd'
        ]
      },
      standalone: {
        narrow: ['F', 'G', 'M', 'G', 'C', 'Ò', 'I', 'L', 'S', 'D', 'S', 'D'],
        abbreviated: [
          'Faoi', 'Gearr', 'Màrt', 'Gibl', 'Cèit', 'Ògmh', 'Iuch', 'Lùna', 'Sult', 'Dàmh', 'Samh',
          'Dùbh'
        ],
        wide: [
          'Am Faoilleach', 'An Gearran', 'Am Màrt', 'An Giblean', 'An Cèitean', 'An t-Ògmhios',
          'An t-Iuchar', 'An Lùnastal', 'An t-Sultain', 'An Dàmhair', 'An t-Samhain', 'An Dùbhlachd'
        ]
      }
    },
    eras: {
      abbreviated: ['RC', 'AD'],
      narrow: ['R', 'A'],
      wide: ['Ro Chrìosta', 'An dèidh Chrìosta']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d\'mh\' MMMM y',
        long: 'd\'mh\' MMMM y',
        medium: 'd MMM y',
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
  currencySettings: {symbol: '£', name: 'Punnd Sasannach'},
  getPluralCase: getPluralCase
};
