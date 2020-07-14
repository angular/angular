/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(function(global) {
global.ng = global.ng || {};
global.ng.common = global.ng.common || {};
global.ng.common.locales = global.ng.common.locales || {};
const u = undefined;
function plural(n) {
  return 5;
}
global.ng.common.locales['zh-hans'] = [
  'zh-Hans',
  [['上午', '下午'], u, u],
  u,
  [
    ['日', '一', '二', '三', '四', '五', '六'],
    ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    [
      '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月',
      '十二月'
    ]
  ],
  u,
  [['公元前', '公元'], u, u],
  0,
  [6, 0],
  ['y/M/d', 'y年M月d日', u, 'y年M月d日EEEE'],
  ['ah:mm', 'ah:mm:ss', 'z ah:mm:ss', 'zzzz ah:mm:ss'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'CNY',
  '¥',
  '人民币',
  {
    'AUD': ['AU$', '$'],
    'CNY': ['¥'],
    'ILR': ['ILS'],
    'JPY': ['JP¥', '¥'],
    'KRW': ['￦', '₩'],
    'TWD': ['NT$'],
    'USD': ['US$', '$'],
    'XXX': []
  },
  'ltr',
  plural,
  [
    [
      ['午夜', '早上', '上午', '中午', '下午', '晚上', '凌晨'], u,
      ['午夜', '清晨', '上午', '中午', '下午', '晚上', '凌晨']
    ],
    [['午夜', '早上', '上午', '中午', '下午', '晚上', '凌晨'], u, u],
    [
      '00:00', ['05:00', '08:00'], ['08:00', '12:00'], ['12:00', '13:00'], ['13:00', '19:00'],
      ['19:00', '24:00'], ['00:00', '05:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
