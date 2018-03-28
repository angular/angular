/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

function plural(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return 3;
  if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return 4;
  return 5;
}

export default [
  'ar-TN',
  [
    ['ص', 'م'],
    ,
  ],
  [['ص', 'م'], , ['صباحًا', 'مساءً']],
  [
    ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    [
      'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس',
      'الجمعة', 'السبت'
    ],
    , ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
  ],
  ,
  [
    ['ج', 'ف', 'م', 'أ', 'م', 'ج', 'ج', 'أ', 'س', 'أ', 'ن', 'د'],
    [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية',
      'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ],
  ],
  , [['ق.م', 'م'], , ['قبل الميلاد', 'ميلادي']], 0, [5, 6],
  ['d\u200f/M\u200f/y', 'dd\u200f/MM\u200f/y', 'd MMMM y', 'EEEE، d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [
    ',', '.', ';', '\u200e%\u200e', '\u200e+', '\u200e-', 'E', '×', '‰', '∞',
    'ليس رقمًا', ':'
  ],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'د.ت.\u200f', 'دينار تونسي', {
    'AED': ['د.إ.\u200f'],
    'ARS': [, 'AR$'],
    'AUD': ['AU$'],
    'BBD': [, 'BB$'],
    'BHD': ['د.ب.\u200f'],
    'BMD': [, 'BM$'],
    'BND': [, 'BN$'],
    'BSD': [, 'BS$'],
    'BZD': [, 'BZ$'],
    'CAD': ['CA$'],
    'CLP': [, 'CL$'],
    'CNY': ['CN¥'],
    'COP': [, 'CO$'],
    'CUP': [, 'CU$'],
    'DOP': [, 'DO$'],
    'DZD': ['د.ج.\u200f'],
    'EGP': ['ج.م.\u200f', 'E£'],
    'FJD': [, 'FJ$'],
    'GBP': ['£', 'UK£'],
    'GYD': [, 'GY$'],
    'HKD': ['HK$'],
    'IQD': ['د.ع.\u200f'],
    'IRR': ['ر.إ.'],
    'JMD': [, 'JM$'],
    'JOD': ['د.أ.\u200f'],
    'JPY': ['JP¥'],
    'KWD': ['د.ك.\u200f'],
    'KYD': [, 'KY$'],
    'LBP': ['ل.ل.\u200f', 'L£'],
    'LYD': ['د.ل.\u200f'],
    'MAD': ['د.م.\u200f'],
    'MRO': ['أ.م.\u200f'],
    'MXN': ['MX$'],
    'NZD': ['NZ$'],
    'OMR': ['ر.ع.\u200f'],
    'QAR': ['ر.ق.\u200f'],
    'SAR': ['ر.س.\u200f'],
    'SBD': [, 'SB$'],
    'SDD': ['د.س.\u200f'],
    'SDG': ['ج.س.'],
    'SRD': [, 'SR$'],
    'SYP': ['ل.س.\u200f', '£'],
    'THB': ['฿'],
    'TND': ['د.ت.\u200f'],
    'TTD': [, 'TT$'],
    'TWD': ['NT$'],
    'USD': ['US$'],
    'UYU': [, 'UY$'],
    'XXX': ['***'],
    'YER': ['ر.ي.\u200f']
  },
  plural
];
