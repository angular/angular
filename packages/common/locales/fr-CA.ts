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
  'fr-CA',
  [
    ['a', 'p'],
    ['a.m.', 'p.m.'],
  ],
  [
    ['a.m.', 'p.m.'],
    ,
  ],
  [
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
  ],
  ,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    [
      'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.',
      'déc.'
    ],
    [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
      'octobre', 'novembre', 'décembre'
    ]
  ],
  , [['av. J.-C.', 'ap. J.-C.'], , ['avant Jésus-Christ', 'après Jésus-Christ']], 0, [6, 0],
  ['yy-MM-dd', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  [
    'HH \'h\' mm', 'HH \'h\' mm \'min\' ss \'s\'', 'HH \'h\' mm \'min\' ss \'s\' z',
    'HH \'h\' mm \'min\' ss \'s\' zzzz'
  ],
  [
    '{1} {0}',
    ,
    '{1} \'à\' {0}',
  ],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], '$', 'dollar canadien',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n));
        if (i === 0 || i === 1) return 1;
        return 5;
      }
];
