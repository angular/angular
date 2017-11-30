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
  'af',
  [
    ['v', 'n'],
    ['vm.', 'nm.'],
  ],
  ,
  [
    ['S', 'M', 'D', 'W', 'D', 'V', 'S'], ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
    ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'],
    ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.']
  ],
  ,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Des.'],
    [
      'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September',
      'Oktober', 'November', 'Desember'
    ]
  ],
  , [['v.C.', 'n.C.'], , ['voor Christus', 'na Christus']], 0, [6, 0],
  ['y-MM-dd', 'dd MMM y', 'dd MMMM y', 'EEEE, dd MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], 'R', 'Suid-Afrikaanse rand', function(n: number):
                                                                                number {
                                                                                  if (n === 1)
                                                                                    return 1;
                                                                                  return 5;
                                                                                }
];
