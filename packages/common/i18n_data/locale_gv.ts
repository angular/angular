/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

import {Plural} from '@angular/common';

export default [
  'gv',
  [
    ['a.m.', 'p.m.'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
    ['Jedoonee', 'Jelhein', 'Jemayrt', 'Jercean', 'Jerdein', 'Jeheiney', 'Jesarn'],
    ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes']
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'J-guer', 'T-arree', 'Mayrnt', 'Avrril', 'Boaldyn', 'M-souree', 'J-souree', 'Luanistyn',
      'M-fouyir', 'J-fouyir', 'M-Houney', 'M-Nollick'
    ],
    [
      'Jerrey-geuree', 'Toshiaght-arree', 'Mayrnt', 'Averil', 'Boaldyn', 'Mean-souree',
      'Jerrey-souree', 'Luanistyn', 'Mean-fouyir', 'Jerrey-fouyir', 'Mee Houney', 'Mee ny Nollick'
    ]
  ],
  ,
  [
    ['RC', 'AD'],
    ,
  ],
  1, [6, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '£', 'GBP',
  function(n: number):
      Plural {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (v === 0 && i % 10 === 1) return Plural.One;
        if (v === 0 && i % 10 === 2) return Plural.Two;
        if (v === 0 &&
            (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
          return Plural.Few;
        if (!(v === 0)) return Plural.Many;
        return Plural.Other;
      }
];
