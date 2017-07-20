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
export const NgLocaleJa: NgLocale = {
  localeId: 'ja',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        },
        narrow: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        },
        wide: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        }
      },
      standalone: {
        abbreviated: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        },
        narrow: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        },
        wide: {
          midnight: '真夜中',
          am: '午前',
          noon: '正午',
          pm: '午後',
          morning1: '朝',
          afternoon1: '昼',
          evening1: '夕方',
          night1: '夜',
          night2: '夜中'
        }
      }
    },
    days: {
      format: {
        narrow: ['日', '月', '火', '水', '木', '金', '土'],
        short: ['日', '月', '火', '水', '木', '金', '土'],
        abbreviated: ['日', '月', '火', '水', '木', '金', '土'],
        wide: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
      },
      standalone: {
        narrow: ['日', '月', '火', '水', '木', '金', '土'],
        short: ['日', '月', '火', '水', '木', '金', '土'],
        abbreviated: ['日', '月', '火', '水', '木', '金', '土'],
        wide: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        wide: [
          '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        wide: [
          '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
        ]
      }
    },
    eras: {abbreviated: ['紀元前', '西暦'], narrow: ['BC', 'AD'], wide: ['紀元前', '西暦']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y年M月d日EEEE', long: 'y年M月d日', medium: 'y/MM/dd', short: 'y/MM/dd'},
      time: {full: 'H時mm分ss秒 zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '19:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '19:00', to: '23:00'},
      night2: {from: '23:00', to: '04:00'},
      noon: '12:00'
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
  currencySettings: {symbol: '￥', name: '日本円'},
  getPluralCase: getPluralCase
};
