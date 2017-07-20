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
export const NgLocaleZhHantMO: NgLocale = {
  localeId: 'zh-Hant-MO',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        },
        narrow: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        },
        wide: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        }
      },
      standalone: {
        abbreviated: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        },
        narrow: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        },
        wide: {
          midnight: '午夜',
          am: '上午',
          pm: '下午',
          morning1: '清晨',
          morning2: '上午',
          afternoon1: '中午',
          afternoon2: '下午',
          evening1: '晚上',
          night1: '凌晨'
        }
      }
    },
    days: {
      format: {
        narrow: ['日', '一', '二', '三', '四', '五', '六'],
        short: ['日', '一', '二', '三', '四', '五', '六'],
        abbreviated: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
        wide: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      },
      standalone: {
        narrow: ['日', '一', '二', '三', '四', '五', '六'],
        short: ['日', '一', '二', '三', '四', '五', '六'],
        abbreviated: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
        wide: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
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
    eras: {abbreviated: ['公元前', '公元'], narrow: ['西元前', '西元'], wide: ['公元前', '公元']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y年M月d日EEEE', long: 'y年M月d日', medium: 'y年M月d日', short: 'd/M/y'},
      time: {full: 'ah:mm:ss [zzzz]', long: 'ah:mm:ss [z]', medium: 'ah:mm:ss', short: 'ah:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '13:00'},
      afternoon2: {from: '13:00', to: '19:00'},
      evening1: {from: '19:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '08:00'},
      morning2: {from: '08:00', to: '12:00'},
      night1: {from: '00:00', to: '05:00'}
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
      nan: '非數值',
      timeSeparator: ':'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'MOP$', name: '澳門元'},
  getPluralCase: getPluralCase
};
