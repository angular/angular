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
  'uz-Arab',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
    ['یکشنبه', 'دوشنبه', 'سه\u200cشنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
    [
      'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر',
      'دسمبر'
    ]
  ],
  u,
  [['BCE', 'CE'], u, u],
  6,
  [4, 5],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'AFN',
  '؋',
  'افغانی',
  {'AFN': ['؋'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'rtl',
  plural
];
