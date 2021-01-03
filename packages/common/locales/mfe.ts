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
  'mfe',
  [['AM', 'PM'], u, u],
  u,
  [
    ['d', 'l', 'm', 'm', 'z', 'v', 's'], ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
    ['dimans', 'lindi', 'mardi', 'merkredi', 'zedi', 'vandredi', 'samdi'],
    ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam']
  ],
  u,
  [
    ['z', 'f', 'm', 'a', 'm', 'z', 'z', 'o', 's', 'o', 'n', 'd'],
    ['zan', 'fev', 'mar', 'avr', 'me', 'zin', 'zil', 'out', 'sep', 'okt', 'nov', 'des'],
    [
      'zanvie', 'fevriye', 'mars', 'avril', 'me', 'zin', 'zilye', 'out', 'septam', 'oktob', 'novam',
      'desam'
    ]
  ],
  u,
  [['av. Z-K', 'ap. Z-K'], u, ['avan Zezi-Krist', 'apre Zezi-Krist']],
  1,
  [6, 0],
  ['d/M/y', 'd MMM, y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'MUR',
  'Rs',
  'roupi morisien',
  {'JPY': ['JP¥', '¥'], 'MUR': ['Rs'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
