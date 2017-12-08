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
  'hu',
  [
    ['de.', 'du.'],
    ,
  ],
  ,
  [
    ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'], ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
    ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'],
    ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo']
  ],
  ,
  [
    ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'A', 'Sz', 'O', 'N', 'D'],
    [
      'jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.',
      'dec.'
    ],
    [
      'január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus',
      'szeptember', 'október', 'november', 'december'
    ]
  ],
  , [['ie.', 'isz.'], ['i. e.', 'i. sz.'], ['Krisztus előtt', 'időszámításunk szerint']], 1, [6, 0],
  ['y. MM. dd.', 'y. MMM d.', 'y. MMMM d.', 'y. MMMM d., EEEE'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], 'Ft', 'magyar forint', function(n: number):
                                                                           number {
                                                                             if (n === 1) return 1;
                                                                             return 5;
                                                                           }
];
