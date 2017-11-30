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
  'nn', [['f.m.', 'e.m.'], , ['formiddag', 'ettermiddag']],
  [
    ['f.m.', 'e.m.'],
    ,
  ],
  [
    ['S', 'M', 'T', 'O', 'T', 'F', 'L'], ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'],
    ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'],
    ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.']
  ],
  [
    ['S', 'M', 'T', 'O', 'T', 'F', 'L'], ['søn', 'mån', 'tys', 'ons', 'tor', 'fre', 'lau'],
    ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'],
    ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.']
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
    [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
    [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [
    ['f.Kr.', 'e.Kr.'],
    ,
  ],
  1, [6, 0], ['dd.MM.y', 'd. MMM y', 'd. MMMM y', 'EEEE d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', '\'kl\'. HH:mm:ss zzzz'],
  ['{1}, {0}', , '{1} \'kl\'. {0}', '{1} {0}'],
  [',', ' ', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'kr', 'norsk krone', function(n: number):
                                                                          number {
                                                                            if (n === 1) return 1;
                                                                            return 5;
                                                                          }
];
