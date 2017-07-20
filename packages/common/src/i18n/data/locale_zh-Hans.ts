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
export const NgLocaleZhHans: NgLocale = {
  localeId: 'zh-Hans',
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
          morning1: '早上',
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
          morning1: '早上',
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
        short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        abbreviated: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        wide: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      },
      standalone: {
        narrow: ['日', '一', '二', '三', '四', '五', '六'],
        short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        abbreviated: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        wide: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        wide: [
          '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月',
          '十二月'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        wide: [
          '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月',
          '十二月'
        ]
      }
    },
    eras: {abbreviated: ['公元前', '公元'], narrow: ['公元前', '公元'], wide: ['公元前', '公元']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y年M月d日EEEE', long: 'y年M月d日', medium: 'y年M月d日', short: 'y/M/d'},
      time: {full: 'zzzz ah:mm:ss', long: 'z ah:mm:ss', medium: 'ah:mm:ss', short: 'ah:mm'},
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
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '￥', name: '人民币'},
  getPluralCase: getPluralCase
};
