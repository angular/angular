/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  'ks', [['AM', 'PM'], u, u], u,
  [
    ['ا', 'ژ', 'ب', 'ب', 'ب', 'ج', 'ب'],
    [
      'آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار',
      'برٛٮ۪سوار', 'جُمہ', 'بٹوار'
    ],
    [
      'اَتھوار', 'ژٔنٛدرٕروار', 'بوٚموار', 'بودوار',
      'برٛٮ۪سوار', 'جُمہ', 'بٹوار'
    ],
    [
      'آتھوار', 'ژٔنٛدٕروار', 'بوٚموار', 'بودوار',
      'برٛٮ۪سوار', 'جُمہ', 'بٹوار'
    ]
  ],
  u,
  [
    ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'س', 'ا', 'ن'],
    [
      'جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن',
      'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر', 'نومبر', 'دسمبر'
    ],
    u
  ],
  u, [['بی سی', 'اے ڈی'], u, ['قبٕل مسیٖح', 'عیٖسوی سنہٕ']], 0, [0, 0],
  ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '\u200e+', '\u200e-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'], '₹', 'ہِندُستٲنۍ رۄپَے',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']}, plural
];
