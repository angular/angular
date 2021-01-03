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
  'nd',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'S', 'S', 'S', 'S', 'M'], ['Son', 'Mvu', 'Sib', 'Sit', 'Sin', 'Sih', 'Mgq'],
    ['Sonto', 'Mvulo', 'Sibili', 'Sithathu', 'Sine', 'Sihlanu', 'Mgqibelo'],
    ['Son', 'Mvu', 'Sib', 'Sit', 'Sin', 'Sih', 'Mgq']
  ],
  u,
  [
    ['Z', 'N', 'M', 'M', 'N', 'N', 'N', 'N', 'M', 'M', 'L', 'M'],
    ['Zib', 'Nhlo', 'Mbi', 'Mab', 'Nkw', 'Nhla', 'Ntu', 'Ncw', 'Mpan', 'Mfu', 'Lwe', 'Mpal'],
    [
      'Zibandlela', 'Nhlolanja', 'Mbimbitho', 'Mabasa', 'Nkwenkwezi', 'Nhlangula', 'Ntulikazi',
      'Ncwabakazi', 'Mpandula', 'Mfumfu', 'Lwezi', 'Mpalakazi'
    ]
  ],
  u,
  [['BC', 'AD'], u, ['UKristo angakabuyi', 'Ukristo ebuyile']],
  0,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'USD',
  'US$',
  'Dola yase Amelika',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
