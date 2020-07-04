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
  'lrc',
  [['AM', 'PM'], u, u],
  u,
  [['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], u, u],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر',
      'نوڤامر', 'دئسامر'
    ],
    u
  ],
  u,
  [['BCE', 'CE'], u, u],
  6,
  [5, 5],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'IRR',
  'IRR',
  'IRR',
  {'IQD': ['د.ع.\u200f'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'rtl',
  plural
];
