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
export const NgLocaleId: NgLocale = {
  localeId: 'id',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        },
        narrow: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        },
        wide: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        },
        narrow: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        },
        wide: {
          midnight: 'tengah malam',
          am: 'AM',
          noon: 'tengah hari',
          pm: 'PM',
          morning1: 'pagi',
          afternoon1: 'siang',
          evening1: 'sore',
          night1: 'malam'
        }
      }
    },
    days: {
      format: {
        narrow: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
        short: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        abbreviated: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        wide: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      },
      standalone: {
        narrow: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
        short: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        abbreviated: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        wide: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September',
          'Oktober', 'November', 'Desember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September',
          'Oktober', 'November', 'Desember'
        ]
      }
    },
    eras: {abbreviated: ['SM', 'M'], narrow: ['SM', 'M'], wide: ['Sebelum Masehi', 'Masehi']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/yy'},
      time: {full: 'HH.mm.ss zzzz', long: 'HH.mm.ss z', medium: 'HH.mm.ss', short: 'HH.mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '10:00', to: '15:00'},
      evening1: {from: '15:00', to: '18:00'},
      midnight: '00:00',
      morning1: {from: '00:00', to: '10:00'},
      night1: {from: '18:00', to: '24:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: '.'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Rp', name: 'Rupiah Indonesia'},
  getPluralCase: getPluralCase
};
