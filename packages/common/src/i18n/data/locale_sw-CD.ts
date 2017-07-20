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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSwCD: NgLocale = {
  localeId: 'sw-CD',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'saa sita za usiku',
          am: 'AM',
          noon: 'saa sita za mchana',
          pm: 'PM',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        },
        narrow: {
          midnight: 'saa sita za usiku',
          am: 'am',
          noon: 'saa sita za mchana',
          pm: 'pm',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        },
        wide: {
          midnight: 'saa sita za usiku',
          am: 'Asubuhi',
          noon: 'saa sita za mchana',
          pm: 'Mchana',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'saa sita za usiku',
          am: 'AM',
          noon: 'saa sita za mchana',
          pm: 'PM',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        },
        narrow: {
          midnight: 'saa sita za usiku',
          am: 'am',
          noon: 'saa sita za mchana',
          pm: 'pm',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        },
        wide: {
          midnight: 'saa sita za usiku',
          am: 'AM',
          noon: 'saa sita za mchana',
          pm: 'PM',
          morning1: 'alfajiri',
          morning2: 'asubuhi',
          afternoon1: 'mchana',
          evening1: 'jioni',
          night1: 'usiku'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
        abbreviated:
            ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
        wide: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
        abbreviated:
            ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
        wide: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      }
    },
    eras: {
      abbreviated: ['KK', 'BK'],
      narrow: ['KK', 'BK'],
      wide: ['Kabla ya Kristo', 'Baada ya Kristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '19:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '07:00'},
      morning2: {from: '07:00', to: '12:00'},
      night1: {from: '19:00', to: '04:00'},
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
      timeSeparator: ':'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FC', name: 'Faranga ya Kongo'},
  getPluralCase: getPluralCase
};
