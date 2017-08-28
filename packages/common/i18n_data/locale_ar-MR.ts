/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

export default [
  'ar-MR',
  [
    ['ص', 'م'],
    ,
  ],
  [['ص', 'م'], , ['صباحًا', 'مساءً']],
  [
    ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    ,
  ],
  ,
  [
    ['ي', 'ف', 'م', 'إ', 'و', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
    [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغشت', 'شتمبر', 'أكتوبر',
      'نوفمبر', 'دجمبر'
    ],
  ],
  , [['ق.م', 'م'], , ['قبل الميلاد', 'ميلادي']], 1, [6, 0],
  ['d‏/M‏/y', 'dd‏/MM‏/y', 'd MMMM، y', 'EEEE، d MMMM، y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', '.', ';', '‎%‎', '‎+', '‎-', 'E', '×', '‰', '∞', 'ليس رقمًا', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'أ.م.‏', 'أوقية موريتانية',
  function(n: number):
      number {
        if (n === 0) return 0;
        if (n === 1) return 1;
        if (n === 2) return 2;
        if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return 3;
        if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return 4;
        return 5;
      }
];
