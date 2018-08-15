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
  'id',
  [['AM', 'PM'], u, u],
  u,
  [
    ['M', 'S', 'S', 'R', 'K', 'J', 'S'], ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September',
      'Oktober', 'November', 'Desember'
    ]
  ],
  u,
  [['SM', 'M'], u, ['Sebelum Masehi', 'Masehi']],
  0,
  [6, 0],
  ['dd/MM/yy', 'd MMM y', 'd MMMM y', 'EEEE, dd MMMM y'],
  ['HH.mm', 'HH.mm.ss', 'HH.mm.ss z', 'HH.mm.ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', '.'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'IDR',
  'Rp',
  'Rupiah Indonesia',
  {
    'AUD': ['AU$', '$'],
    'IDR': ['Rp'],
    'INR': ['Rs', '₹'],
    'JPY': ['JP¥', '¥'],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'USD': ['US$', '$'],
    'XXX': []
  },
  'ltr',
  plural
];
