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
  'rm',
  [
    ['AM', 'PM'],
    ,
  ],
  ,
  [
    ['D', 'G', 'M', 'M', 'G', 'V', 'S'], ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
    ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda'],
    ['du', 'gli', 'ma', 'me', 'gie', 've', 'so']
  ],
  ,
  [
    ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
    [
      'schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.', 'nov.',
      'dec.'
    ],
    [
      'schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember',
      'october', 'november', 'december'
    ]
  ],
  , [['av. Cr.', 's. Cr.'], , ['avant Cristus', 'suenter Cristus']], 1, [6, 0],
  ['dd-MM-yy', 'dd-MM-y', 'd \'da\' MMMM y', 'EEEE, \'ils\' d \'da\' MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', '’', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'CHF', 'franc svizzer', function(n: number):
                                                                             number {
                                                                               if (n === 1)
                                                                                 return 1;
                                                                               return 5;
                                                                             }
];
