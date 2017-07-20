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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleMsSG: NgLocale = {
  localeId: 'ms-SG',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'PG',
          pm: 'PTG',
          morning1: 'pagi',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        },
        narrow: {
          am: 'a',
          pm: 'p',
          morning1: 'pagi',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        },
        wide: {
          am: 'PG',
          pm: 'PTG',
          morning1: 'pagi',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        }
      },
      standalone: {
        abbreviated: {
          am: 'PG',
          pm: 'PTG',
          morning1: 'tengah malam',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        },
        narrow: {
          am: 'a',
          pm: 'p',
          morning1: 'pagi',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        },
        wide: {
          am: 'PG',
          pm: 'PTG',
          morning1: 'tengah malam',
          morning2: 'pagi',
          afternoon1: 'tengah hari',
          evening1: 'petang',
          night1: 'malam'
        }
      }
    },
    days: {
      format: {
        narrow: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
        short: ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'],
        abbreviated: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
        wide: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']
      },
      standalone: {
        narrow: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
        short: ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'],
        abbreviated: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
        wide: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September',
          'Oktober', 'November', 'Disember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September',
          'Oktober', 'November', 'Disember'
        ]
      }
    },
    eras: {abbreviated: ['S.M.', 'TM'], narrow: ['S.M.', 'TM'], wide: ['S.M.', 'TM']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/MM/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      evening1: {from: '14:00', to: '19:00'},
      morning1: {from: '00:00', to: '01:00'},
      morning2: {from: '01:00', to: '12:00'},
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
  currencySettings: {symbol: '$', name: 'Dolar Singapura'},
  getPluralCase: getPluralCase
};
