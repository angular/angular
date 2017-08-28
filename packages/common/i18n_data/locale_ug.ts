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
  'ug', [['ب', 'ك'], ['چ.ب', 'چ.ك'], ['چۈشتىن بۇرۇن', 'چۈشتىن كېيىن']],
  [
    ['چ.ب', 'چ.ك'],
    ,
  ],
  [
    ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'], ['يە', 'دۈ', 'سە', 'چا', 'پە', 'جۈ', 'شە'],
    ['يەكشەنبە', 'دۈشەنبە', 'سەيشەنبە', 'چارشەنبە', 'پەيشەنبە', 'جۈمە', 'شەنبە'],
    ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش']
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر',
      'ئۆكتەبىر', 'نويابىر', 'دېكابىر'
    ],
  ],
  , [['BCE', 'مىلادىيە'], , ['مىلادىيەدىن بۇرۇن', 'مىلادىيە']], 0, [6, 0],
  ['y-MM-dd', 'd-MMM، y', 'd-MMMM، y', 'y d-MMMM، EEEE'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  [
    '{1}، {0}',
    ,
    '{1} {0}',
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '￥', 'جۇڭگو يۈەنى', function(n: number):
                                                                        number {
                                                                          if (n === 1) return 1;
                                                                          return 5;
                                                                        }
];
