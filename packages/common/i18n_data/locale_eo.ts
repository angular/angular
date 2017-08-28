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
  'eo',
  [
    ['atm', 'ptm'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
    ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato'],
    ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa']
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
    [
      'januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto', 'septembro',
      'oktobro', 'novembro', 'decembro'
    ]
  ],
  ,
  [
    ['aK', 'pK'],
    ,
  ],
  1, [6, 0], ['yy-MM-dd', 'y-MMM-dd', 'y-MMMM-dd', 'EEEE, d-\'a\' \'de\' MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'H-\'a\' \'horo\' \'kaj\' m:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], , function(n: number):
                                                      number {
                                                        if (n === 1) return 1;
                                                        return 5;
                                                      }
];
