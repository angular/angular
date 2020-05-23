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
  global.ng.common.locales['fa'] = [
    'fa',
    [['ق', 'ب'], ['ق.ظ.', 'ب.ظ.'], ['قبل\u200cازظهر', 'بعدازظهر']],
    u,
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
      ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
      [
        'ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ', 'ژوئن',
        'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
      ],
      u
    ],
    [
      ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
      [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه',
        'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
      ],
      u
    ],
    [['ق', 'م'], ['ق.م.', 'م.'], ['قبل از میلاد', 'میلادی']],
    6,
    [5, 5],
    ['y/M/d', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
    ['{1}،\u200f {0}', u, '{1}، ساعت {0}', u],
    ['.', ',', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'ناعدد', ':'],
    ['#,##0.###', '#,##0%', '\u200e¤ #,##0.00', '#E0'],
    'IRR',
    'ریال',
    'ریال ایران',
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
    'rtl',
    plural,
    [
      [
        ['ب', 'ص', 'ظ', 'ع', 'ش', 'ن'],
        ['بامداد', 'صبح', 'ظهر', 'عصر', 'شب', 'نیمه\u200cشب'], u
      ],
      u,
      [
        ['01:00', '04:00'], ['04:00', '12:00'], ['12:00', '13:00'], ['13:00', '19:00'],
        ['19:00', '24:00'], ['00:00', '01:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
