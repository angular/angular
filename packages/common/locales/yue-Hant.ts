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
  'yue-Hant',
  [['上午', '下午'], u, u],
  u,
  [
    ['日', '一', '二', '三', '四', '五', '六'],
    ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], u,
    ['日', '一', '二', '三', '四', '五', '六']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], u
  ],
  u,
  [['西元前', '西元'], u, u],
  0,
  [6, 0],
  ['y/M/d', 'y年M月d日', u, 'y年M月d日 EEEE'],
  ['ah:mm', 'ah:mm:ss', 'ah:mm:ss [z]', 'ah:mm:ss [zzzz]'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', '非數值', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'HKD',
  'HK$',
  '港幣',
  {'AUD': ['AU$', '$'], 'KRW': ['￦', '₩'], 'USD': ['US$', '$'], 'XXX': []},
  'ltr',
  plural
];
