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
    if (n === 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return 3;
    if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return 4;
    return 5;
  }
  global.ng.common.locales['ar-dj'] = [
    'ar-DJ',
    [['ص', 'م'], u, u],
    [['ص', 'م'], u, ['صباحًا', 'مساءً']],
    [
      ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
      [
        'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس',
        'الجمعة', 'السبت'
      ],
      u,
      ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    ],
    u,
    [
      ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
      [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ],
      u
    ],
    u,
    [['ق.م', 'م'], u, ['قبل الميلاد', 'ميلادي']],
    6,
    [6, 0],
    ['d\u200f/M\u200f/y', 'dd\u200f/MM\u200f/y', 'd MMMM y', 'EEEE، d MMMM y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    [
      '.', ',', ';', '\u200e%\u200e', '\u200e+', '\u200e-', 'E', '×', '‰', '∞',
      'ليس رقمًا', ':'
    ],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    'DJF',
    'Fdj',
    'فرنك جيبوتي',
    {
      'AED': ['د.إ.\u200f'],
      'ARS': [u, 'AR$'],
      'AUD': ['AU$'],
      'BBD': [u, 'BB$'],
      'BHD': ['د.ب.\u200f'],
      'BMD': [u, 'BM$'],
      'BND': [u, 'BN$'],
      'BSD': [u, 'BS$'],
      'BZD': [u, 'BZ$'],
      'CAD': ['CA$'],
      'CLP': [u, 'CL$'],
      'CNY': ['CN¥'],
      'COP': [u, 'CO$'],
      'CUP': [u, 'CU$'],
      'DJF': ['Fdj'],
      'DOP': [u, 'DO$'],
      'DZD': ['د.ج.\u200f'],
      'EGP': ['ج.م.\u200f', 'E£'],
      'FJD': [u, 'FJ$'],
      'GBP': ['UK£'],
      'GYD': [u, 'GY$'],
      'HKD': ['HK$'],
      'IQD': ['د.ع.\u200f'],
      'IRR': ['ر.إ.'],
      'JMD': [u, 'JM$'],
      'JOD': ['د.أ.\u200f'],
      'JPY': ['JP¥'],
      'KWD': ['د.ك.\u200f'],
      'KYD': [u, 'KY$'],
      'LBP': ['ل.ل.\u200f', 'L£'],
      'LRD': [u, '$LR'],
      'LYD': ['د.ل.\u200f'],
      'MAD': ['د.م.\u200f'],
      'MRU': ['أ.م.'],
      'MXN': ['MX$'],
      'NZD': ['NZ$'],
      'OMR': ['ر.ع.\u200f'],
      'QAR': ['ر.ق.\u200f'],
      'SAR': ['ر.س.\u200f'],
      'SBD': [u, 'SB$'],
      'SDD': ['د.س.\u200f'],
      'SDG': ['ج.س.'],
      'SRD': [u, 'SR$'],
      'SYP': ['ل.س.\u200f', '£'],
      'THB': ['฿'],
      'TND': ['د.ت.\u200f'],
      'TTD': [u, 'TT$'],
      'TWD': ['NT$'],
      'USD': ['US$'],
      'UYU': [u, 'UY$'],
      'XXX': ['***'],
      'YER': ['ر.ي.\u200f']
    },
    plural,
    [
      [
        [
          'فجرًا', 'صباحًا', 'ظهرًا', 'بعد الظهر', 'مساءً',
          'منتصف الليل', 'ليلاً'
        ],
        [
          'فجرًا', 'ص', 'ظهرًا', 'بعد الظهر', 'مساءً',
          'منتصف الليل', 'ليلاً'
        ],
        [
          'فجرًا', 'صباحًا', 'ظهرًا', 'بعد الظهر', 'مساءً',
          'منتصف الليل', 'ليلاً'
        ]
      ],
      u,
      [
        ['03:00', '06:00'], ['06:00', '12:00'], ['12:00', '13:00'], ['13:00', '18:00'],
        ['18:00', '24:00'], ['00:00', '01:00'], ['01:00', '03:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
