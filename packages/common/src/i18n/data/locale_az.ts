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
export const NgLocaleAz: NgLocale = {
  localeId: 'az',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'gecəyarı',
          am: 'AM',
          noon: 'günorta',
          pm: 'PM',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        },
        narrow: {
          midnight: 'gecəyarı',
          am: 'a',
          noon: 'g',
          pm: 'p',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        },
        wide: {
          midnight: 'gecəyarı',
          am: 'AM',
          noon: 'günorta',
          pm: 'PM',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'gecəyarı',
          am: 'AM',
          noon: 'günorta',
          pm: 'PM',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        },
        narrow: {
          midnight: 'gecəyarı',
          am: 'AM',
          noon: 'günorta',
          pm: 'PM',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        },
        wide: {
          midnight: 'gecəyarı',
          am: 'AM',
          noon: 'günorta',
          pm: 'PM',
          morning1: 'sübh',
          morning2: 'səhər',
          afternoon1: 'gündüz',
          evening1: 'axşamüstü',
          night1: 'axşam',
          night2: 'gecə'
        }
      }
    },
    days: {
      format: {
        narrow: ['7', '1', '2', '3', '4', '5', '6'],
        short: ['B.', 'B.E.', 'Ç.A.', 'Ç.', 'C.A.', 'C.', 'Ş.'],
        abbreviated: ['B.', 'B.E.', 'Ç.A.', 'Ç.', 'C.A.', 'C.', 'Ş.'],
        wide: [
          'bazar', 'bazar ertəsi', 'çərşənbə axşamı', 'çərşənbə', 'cümə axşamı', 'cümə', 'şənbə'
        ]
      },
      standalone: {
        narrow: ['7', '1', '2', '3', '4', '5', '6'],
        short: ['B.', 'B.E.', 'Ç.A.', 'Ç.', 'C.A.', 'C.', 'Ş.'],
        abbreviated: ['B.', 'B.E.', 'Ç.A.', 'Ç.', 'C.A.', 'C.', 'Ş.'],
        wide: [
          'bazar', 'bazar ertəsi', 'çərşənbə axşamı', 'çərşənbə', 'cümə axşamı', 'cümə', 'şənbə'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
        wide: [
          'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr',
          'oktyabr', 'noyabr', 'dekabr'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
        wide: [
          'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr',
          'Oktyabr', 'Noyabr', 'Dekabr'
        ]
      }
    },
    eras: {
      abbreviated: ['e.ə.', 'y.e.'],
      narrow: ['e.ə.', 'y.e.'],
      wide: ['eramızdan əvvəl', 'yeni era']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'd MMMM y, EEEE', long: 'd MMMM y', medium: 'd MMM y', short: 'dd.MM.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '17:00'},
      evening1: {from: '17:00', to: '19:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '19:00', to: '24:00'},
      night2: {from: '00:00', to: '04:00'},
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₼', name: 'Azərbaycan Manatı'},
  getPluralCase: getPluralCase
};
