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
  'he',
  [
    ['לפנה״צ', 'אחה״צ'],
    ,
  ],
  ,
  [
    ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
    ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
    ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'],
    [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר',
      'נובמבר', 'דצמבר'
    ]
  ],
  , [['לפנה״ס', 'לספירה'], , ['לפני הספירה', 'לספירה']], 0, [5, 6],
  ['d.M.y', 'd בMMM y', 'd בMMMM y', 'EEEE, d בMMMM y'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  [
    '{1}, {0}',
    ,
    '{1} בשעה {0}',
  ],
  ['.', ',', ';', '%', '‎+', '‎-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '‏#,##0.00 ¤;‏-#,##0.00 ¤', '#E0'], '₪', 'שקל חדש',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        if (i === 2 && v === 0) return 2;
        if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0) return 4;
        return 5;
      }
];
