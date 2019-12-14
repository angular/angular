/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(function(global) {
  global.ng = global.ng || {};
  global.ng.common = global.ng.common || {};
  global.ng.common.locales = global.ng.common.locales || {};
  const u = undefined;
  function plural(n) {
    if (n === 1) return 1;
    return 5;
  }
  global.ng.common.locales['ckb-ir'] = [
    'ckb-IR',
    [['ب.ن', 'د.ن'], u, u],
    u,
    [
      ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
      [
        'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە',
        'پێنجشەممە', 'ھەینی', 'شەممە'
      ],
      u, ['١ش', '٢ش', '٣ش', '٤ش', '٥ش', 'ھ', 'ش']
    ],
    u,
    [
      ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
      [
        'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار',
        'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم',
        'تشرینی دووەم', 'کانونی یەکەم'
      ],
      u
    ],
    u,
    [['پێش زایین', 'زایینی'], u, u],
    6,
    [5, 5],
    ['y-MM-dd', 'y MMM d', 'dی MMMMی y', 'y MMMM d, EEEE'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '\u200e+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    'IRR',
    'IRR',
    'IRR',
    {'IQD': ['د.ع.\u200f'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'rtl',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
