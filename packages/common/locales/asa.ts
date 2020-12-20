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
  'asa',
  [['icheheavo', 'ichamthi'], u, u],
  u,
  [
    ['J', 'J', 'J', 'J', 'A', 'I', 'J'], ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
    ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
    ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Dec'],
    [
      'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
      'Oktoba', 'Novemba', 'Desemba'
    ]
  ],
  u,
  [['KM', 'BM'], u, ['Kabla yakwe Yethu', 'Baada yakwe Yethu']],
  1,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'TZS',
  'TSh',
  'shilingi ya Tandhania',
  {'JPY': ['JP¥', '¥'], 'TZS': ['TSh'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
