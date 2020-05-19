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
  if (n === 1) return 1;
  return 5;
}

export default [
  'eo',
  [['atm', 'ptm'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
    ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato'],
    ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
    [
      'januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto', 'septembro',
      'oktobro', 'novembro', 'decembro'
    ]
  ],
  u,
  [['aK', 'pK'], u, u],
  1,
  [6, 0],
  ['yy-MM-dd', 'y-MMM-dd', 'y-MMMM-dd', 'EEEE, d-\'a\' \'de\' MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'H-\'a\' \'horo\' \'kaj\' m:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  u,
  u,
  u,
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
