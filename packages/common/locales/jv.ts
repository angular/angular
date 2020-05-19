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
  'jv',
  [['Isuk', 'Wengi'], u, u],
  u,
  [
    ['A', 'S', 'S', 'R', 'K', 'J', 'S'], ['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    ['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September',
      'Oktober', 'November', 'Desember'
    ]
  ],
  u,
  [['SM', 'M'], u, ['Sakdurunge Masehi', 'Masehi']],
  0,
  [6, 0],
  ['dd-MM-y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} {0}', u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'IDR',
  'Rp',
  'Rupiah Indonesia',
  {'IDR': ['Rp'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
