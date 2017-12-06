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
  'hi',
  [
    ['पू', 'अ'],
    ['पूर्वाह्न', 'अपराह्न'],
  ],
  ,
  [
    ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'], ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
  ],
  ,
  [
    ['ज', 'फ़', 'मा', 'अ', 'म', 'जू', 'जु', 'अ', 'सि', 'अ', 'न', 'दि'],
    ['जन॰', 'फ़र॰', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल॰', 'अग॰', 'सित॰', 'अक्तू॰', 'नव॰', 'दिस॰'],
    [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर',
      'दिसंबर'
    ]
  ],
  , [['ईसा-पूर्व', 'ईस्वी'], , ['ईसा-पूर्व', 'ईसवी सन']], 0, [0, 0],
  ['d/M/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  [
    '{1}, {0}',
    ,
    '{1} को {0}',
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##,##0%', '¤#,##,##0.00', '[#E0]'], '₹', 'भारतीय रुपया',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1) return 1;
        return 5;
      }
];
