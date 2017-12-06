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
  'zu',
  [
    ['a', 'p'],
    ['AM', 'PM'],
  ],
  [
    ['AM', 'PM'],
    ,
  ],
  [
    ['S', 'M', 'B', 'T', 'S', 'H', 'M'], ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
    ['ISonto', 'UMsombuluko', 'ULwesibili', 'ULwesithathu', 'ULwesine', 'ULwesihlanu', 'UMgqibelo'],
    ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq']
  ],
  ,
  [
    ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
    [
      'Januwari', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septhemba',
      'Okthoba', 'Novemba', 'Disemba'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
    [
      'Januwari', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septhemba',
      'Okthoba', 'Novemba', 'Disemba'
    ]
  ],
  [
    ['BC', 'AD'],
    ,
  ],
  0, [6, 0], ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], 'R', 'i-South African Rand',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1) return 1;
        return 5;
      }
];
