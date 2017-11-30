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
  'prg',
  [
    ['AM', 'PM'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ,
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
  ],
  ,
  [
    ['BCE', 'CE'],
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
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], ,
  function(n: number):
      number {
        let v = n.toString().replace(/^[^.]*\.?/, '').length,
            f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
        if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
            v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
          return 0;
        if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
            !(v === 2) && f % 10 === 1)
          return 1;
        return 5;
      }
];
