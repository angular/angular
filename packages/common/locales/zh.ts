/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  return 5;
}

export default [
  'zh',
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
  plural
];
