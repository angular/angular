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
  'it',
  [
    ['m.', 'p.'],
    ['AM', 'PM'],
  ],
  ,
  [
    ['D', 'L', 'M', 'M', 'G', 'V', 'S'], ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
    ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
    ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
  ],
  ,
  [
    ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
    ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    [
      'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre',
      'ottobre', 'novembre', 'dicembre'
    ]
  ],
  , [['aC', 'dC'], ['a.C.', 'd.C.'], ['avanti Cristo', 'dopo Cristo']], 1, [6, 0],
  ['dd/MM/yy', 'dd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1}, {0}',
    ,
    '{1} {0}',
  ],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '€', 'euro',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        return 5;
      }
];
