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
  'pa-Arab',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
    u, u
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر',
      'دسمبر'
    ],
    u
  ],
  u,
  [['ايساپورو', 'سں'], u, u],
  0,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, dd MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '\u200e+', '\u200e-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'PKR',
  'ر',
  'روپئیہ',
  {'JPY': ['JP¥', '¥'], 'PKR': ['ر', 'Rs'], 'USD': ['US$', '$']},
  'rtl',
  plural
];
