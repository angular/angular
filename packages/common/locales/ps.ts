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
  'ps',
  [
    ['غ.م.', 'غ.و.'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    ,
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اګست', 'سپتمبر', 'اکتوبر', 'نومبر',
      'دسمبر'
    ],
  ],
  , [['له میلاد وړاندې', 'م.'], , ['له میلاد څخه وړاندې', 'له میلاد څخه وروسته']], 6, [4, 5],
  ['y/M/d', 'y MMM d', 'د y د MMMM d', 'EEEE د y د MMMM d'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', '.', ';', '%', '‎+', '‎−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '؋', 'افغانۍ', function(n: number):
                                                                   number {
                                                                     if (n === 1) return 1;
                                                                     return 5;
                                                                   }
];
