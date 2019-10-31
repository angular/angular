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
    let i = Math.floor(Math.abs(n));
    if (i === 0 || n === 1) return 1;
    return 5;
  }
  root.ng.common.locales['fa-af'] = [
    'fa-AF',
    [['ق', 'ب'], ['ق.ظ.', 'ب.ظ.'], ['قبل\u200cازظهر', 'بعدازظهر']],
    [['ق.ظ.', 'ب.ظ.'], u, ['قبل\u200cازظهر', 'بعدازظهر']],
    [
      ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
      [
        'یکشنبه', 'دوشنبه', 'سه\u200cشنبه', 'چهارشنبه', 'پنجشنبه',
        'جمعه', 'شنبه'
      ],
      u, ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش']
    ],
    u,
    [
      ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
      [
        'جنو', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جول', 'اگست',
        'سپتمبر', 'اکتوبر', 'نومبر', 'دسم'
      ],
      [
        'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای',
        'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'
      ]
    ],
    [
      ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
      [
        'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای',
        'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'
      ],
      u
    ],
    [['ق', 'م'], ['ق.م.', 'م.'], ['قبل از میلاد', 'میلادی']],
    6,
    [4, 5],
    ['y/M/d', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
    ['{1}،\u200f {0}', u, '{1}، ساعت {0}', u],
    ['.', ',', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'ناعدد', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    '؋',
    'افغانی افغانستان',
    {
      'AFN': ['؋'],
      'CAD': ['$CA', '$'],
      'CNY': ['¥CN', '¥'],
      'HKD': ['$HK', '$'],
      'IRR': ['ریال'],
      'MXN': ['$MX', '$'],
      'NZD': ['$NZ', '$'],
      'THB': ['฿'],
      'XCD': ['$EC', '$']
    },
    plural,
    [
      [
        ['ن', 'ظ', 'ص', 'ب.ظ.', 'ش', 'ش'],
        ['نیمه\u200cشب', 'ظهر', 'صبح', 'بعد از چاشت', 'شام', 'شب'], u
      ],
      [
        ['ن', 'ظ', 'ص', 'بعد از چاشت', 'شام', 'ش'],
        ['نیمه\u200cشب', 'ظهر', 'صبح', 'بعد از چاشت', 'شام', 'شب'], u
      ],
      [
        '00:00', '12:00', ['04:00', '12:00'], ['12:00', '17:00'], ['17:00', '19:00'],
        ['19:00', '04:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
