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
  if (n === 0) return Plural.Zero;
  if (n === 1) return Plural.One;
  if (n === 2) return Plural.Two;
  if (n === 3) return Plural.Few;
  if (n === 6) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleCy: NgLocale = {
  localeId: 'cy',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'yb', pm: 'yh'},
        narrow: {am: 'b', pm: 'h'},
        wide: {am: 'yb', pm: 'yh'}
      },
      standalone: {
        abbreviated: {am: 'yb', pm: 'yh'},
        narrow: {am: 'yb', pm: 'yh'},
        wide: {am: 'yb', pm: 'yh'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'Ll', 'M', 'M', 'I', 'G', 'S'],
        short: ['Su', 'Ll', 'Ma', 'Me', 'Ia', 'Gw', 'Sa'],
        abbreviated: ['Sul', 'Llun', 'Maw', 'Mer', 'Iau', 'Gwen', 'Sad'],
        wide: [
          'Dydd Sul', 'Dydd Llun', 'Dydd Mawrth', 'Dydd Mercher', 'Dydd Iau', 'Dydd Gwener',
          'Dydd Sadwrn'
        ]
      },
      standalone: {
        narrow: ['S', 'Ll', 'M', 'M', 'I', 'G', 'S'],
        short: ['Su', 'Ll', 'Ma', 'Me', 'Ia', 'Gw', 'Sa'],
        abbreviated: ['Sul', 'Llun', 'Maw', 'Mer', 'Iau', 'Gwe', 'Sad'],
        wide: [
          'Dydd Sul', 'Dydd Llun', 'Dydd Mawrth', 'Dydd Mercher', 'Dydd Iau', 'Dydd Gwener',
          'Dydd Sadwrn'
        ]
      }
    },
    months: {
      format: {
        narrow: ['I', 'Ch', 'M', 'E', 'M', 'M', 'G', 'A', 'M', 'H', 'T', 'Rh'],
        abbreviated: [
          'Ion', 'Chwef', 'Maw', 'Ebrill', 'Mai', 'Meh', 'Gorff', 'Awst', 'Medi', 'Hyd', 'Tach',
          'Rhag'
        ],
        wide: [
          'Ionawr', 'Chwefror', 'Mawrth', 'Ebrill', 'Mai', 'Mehefin', 'Gorffennaf', 'Awst', 'Medi',
          'Hydref', 'Tachwedd', 'Rhagfyr'
        ]
      },
      standalone: {
        narrow: ['I', 'Ch', 'M', 'E', 'M', 'M', 'G', 'A', 'M', 'H', 'T', 'Rh'],
        abbreviated: [
          'Ion', 'Chw', 'Maw', 'Ebr', 'Mai', 'Meh', 'Gor', 'Awst', 'Medi', 'Hyd', 'Tach', 'Rhag'
        ],
        wide: [
          'Ionawr', 'Chwefror', 'Mawrth', 'Ebrill', 'Mai', 'Mehefin', 'Gorffennaf', 'Awst', 'Medi',
          'Hydref', 'Tachwedd', 'Rhagfyr'
        ]
      }
    },
    eras: {abbreviated: ['CC', 'OC'], narrow: ['C', 'O'], wide: ['Cyn Crist', 'Oed Crist']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'am\' {0}', long: '{1} \'am\' {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: '£', name: 'Punt Prydain'},
  getPluralCase: getPluralCase
};
