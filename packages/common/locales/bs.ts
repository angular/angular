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
  'bs',
  [
    ['prijepodne', 'popodne'],
    ,
  ],
  ,
  [
    ['N', 'P', 'U', 'S', 'Č', 'P', 'S'], ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
    ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
    ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub']
  ],
  [
    ['n', 'p', 'u', 's', 'č', 'p', 's'], ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
    ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
    ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub']
  ],
  [
    ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
    ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
    [
      'januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'avgust', 'septembar', 'oktobar',
      'novembar', 'decembar'
    ]
  ],
  , [['p. n. e.', 'n. e.'], , ['prije nove ere', 'nove ere']], 1, [6, 0],
  ['d.M.yy.', 'd. MMM y.', 'd. MMMM y.', 'EEEE, d. MMMM y.'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    '{1} \'u\' {0}',
  ],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'KM', 'Bosanskohercegovačka konvertibilna marka',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
            f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
        if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
          return 1;
        if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
                !(i % 100 >= 12 && i % 100 <= 14) ||
            f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
                !(f % 100 >= 12 && f % 100 <= 14))
          return 3;
        return 5;
      }
];
