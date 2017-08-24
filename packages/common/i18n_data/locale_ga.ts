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
  'ga',
  [
    ['a', 'p'],
    ['a.m.', 'p.m.'],
  ],
  ,
  [
    ['D', 'L', 'M', 'C', 'D', 'A', 'S'], ['Domh', 'Luan', 'Máirt', 'Céad', 'Déar', 'Aoine', 'Sath'],
    [
      'Dé Domhnaigh', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin', 'Dé hAoine', 'Dé Sathairn'
    ],
    ['Do', 'Lu', 'Má', 'Cé', 'Dé', 'Ao', 'Sa']
  ],
  ,
  [
    ['E', 'F', 'M', 'A', 'B', 'M', 'I', 'L', 'M', 'D', 'S', 'N'],
    [
      'Ean', 'Feabh', 'Márta', 'Aib', 'Beal', 'Meith', 'Iúil', 'Lún', 'MFómh', 'DFómh', 'Samh',
      'Noll'
    ],
    [
      'Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa',
      'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Nollaig'
    ]
  ],
  , [['RC', 'AD'], , ['Roimh Chríost', 'Anno Domini']], 0, [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '€', 'Euro',
  function(n: number):
      number {
        if (n === 1) return 1;
        if (n === 2) return 2;
        if (n === Math.floor(n) && n >= 3 && n <= 6) return 3;
        if (n === Math.floor(n) && n >= 7 && n <= 10) return 4;
        return 5;
      }
];
