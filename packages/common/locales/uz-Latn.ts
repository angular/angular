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
  'uz-Latn',
  [['TO', 'TK'], u, u],
  u,
  [
    ['Y', 'D', 'S', 'C', 'P', 'J', 'S'], ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
    ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
    ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
  ],
  u,
  [
    ['Y', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
    ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr',
      'noyabr', 'dekabr'
    ]
  ],
  [
    ['Y', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
    ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
    [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr',
      'Noyabr', 'Dekabr'
    ]
  ],
  [['m.a.', 'milodiy'], u, ['miloddan avvalgi', 'milodiy']],
  1,
  [6, 0],
  ['dd/MM/yy', 'd-MMM, y', 'd-MMMM, y', 'EEEE, d-MMMM, y'],
  ['HH:mm', 'HH:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
  ['{1}, {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'son emas', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'UZS',
  'soʻm',
  'O‘zbekiston so‘mi',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'], 'UZS': ['soʻm']},
  'ltr',
  plural
];
