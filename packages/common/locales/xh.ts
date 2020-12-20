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
  'xh',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Caw', 'Mvu', 'Bin', 'Tha', 'Sin', 'Hla', 'Mgq'],
    ['Cawe', 'Mvulo', 'Lwesibini', 'Lwesithathu', 'Lwesine', 'Lwesihlanu', 'Mgqibelo'],
    ['Caw', 'Mvu', 'Bin', 'Tha', 'Sin', 'Hla', 'Mgq']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['Jan', 'Feb', 'Mat', 'Epr', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
    [
      'Janyuwari', 'Februwari', 'Matshi', 'Epreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septemba',
      'Okthoba', 'Novemba', 'Disemba'
    ]
  ],
  u,
  [['BC', 'AD'], u, u],
  0,
  [6, 0],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'ZAR',
  'R',
  'iRandi yaseMzanzi Afrika',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'], 'ZAR': ['R']},
  'ltr',
  plural
];
