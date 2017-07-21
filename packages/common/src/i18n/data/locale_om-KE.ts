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
export const NgLocaleOmKE: NgLocale = {
  localeId: 'om-KE',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'WD', pm: 'WB'},
        narrow: {am: 'WD', pm: 'WB'},
        wide: {am: 'WD', pm: 'WB'}
      },
      standalone: {
        abbreviated: {am: 'WD', pm: 'WB'},
        narrow: {am: 'WD', pm: 'WB'},
        wide: {am: 'WD', pm: 'WB'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'W', 'Q', 'R', 'K', 'J', 'S'],
        short: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
        abbreviated: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
        wide: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata']
      },
      standalone: {
        narrow: ['D', 'W', 'Q', 'R', 'K', 'J', 'S'],
        short: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
        abbreviated: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
        wide: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
        wide: [
          'Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa',
          'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'
        ]
      },
      standalone: {
        narrow: ['A', 'G', 'B', 'E', 'C', 'W', 'A', 'H', 'F', 'O', 'S', 'M'],
        abbreviated:
            ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
        wide: [
          'Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa',
          'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'
        ]
      }
    },
    eras: {abbreviated: ['KD', 'CE'], narrow: ['KD', 'CE'], wide: ['Dheengadda Jeesu', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'dd MMMM y', medium: 'dd-MMM-y', short: 'dd/MM/yy'},
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
  currencySettings: {symbol: 'Ksh', name: 'KES'},
  getPluralCase: getPluralCase
};
