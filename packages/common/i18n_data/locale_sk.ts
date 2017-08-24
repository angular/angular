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
  'sk',
  [
    ['AM', 'PM'],
    ,
  ],
  ,
  [
    ['n', 'p', 'u', 's', 'š', 'p', 's'], ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
    ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'],
    ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so']
  ],
  ,
  [
    ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
    ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
    [
      'januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra',
      'októbra', 'novembra', 'decembra'
    ]
  ],
  [
    ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
    ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
    [
      'január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september', 'október',
      'november', 'december'
    ]
  ],
  [['pred Kr.', 'po Kr.'], , ['pred Kristom', 'po Kristovi']], 1, [6, 0],
  ['d. M. y', , 'd. MMMM y', 'EEEE, d. MMMM y'], ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  [
    '{1} {0}',
    '{1}, {0}',
    ,
  ],
  [',', ' ', ';', '%', '+', '-', 'e', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], '€', 'euro',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return 3;
        if (!(v === 0)) return 4;
        return 5;
      }
];
