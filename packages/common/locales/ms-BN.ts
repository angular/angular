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
  'ms-BN',
  [['a', 'p'], ['PG', 'PTG'], u],
  u,
  [
    ['A', 'I', 'S', 'R', 'K', 'J', 'S'], ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
    ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
    ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
    [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober',
      'November', 'Disember'
    ]
  ],
  u,
  [['S.M.', 'TM'], u, u],
  1,
  [6, 0],
  ['d/MM/yy', 'd MMM y', 'd MMMM y', 'dd MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1}, {0}', u, '{1} {0}', u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'BND',
  '$',
  'Dolar Brunei',
  {
    'BND': ['$'],
    'CAD': [u, '$'],
    'JPY': ['JP¥', '¥'],
    'MXN': [u, '$'],
    'MYR': ['RM'],
    'TWD': ['NT$'],
    'USD': [u, '$']
  },
  'ltr',
  plural
];
