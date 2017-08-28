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
  'ar-KM',
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
    ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
    [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
      'نوفمبر', 'ديسمبر'
    ],
  ],
  , [['ق.م', 'م'], , ['قبل الميلاد', 'ميلادي']], 1, [6, 0],
  ['d‏/M‏/y', 'dd‏/MM‏/y', 'd MMMM، y', 'EEEE، d MMMM، y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '‎%‎', '‎+', '‎-', 'E', '×', '‰', '∞', 'ليس رقمًا', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'ف.ج.ق.‏', 'فرنك جزر القمر',
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
