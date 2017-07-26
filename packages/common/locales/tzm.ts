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
  'tzm',
  [
    ['Zdat azal', 'Ḍeffir aza'],
    ,
  ],
  ,
  [
    ['A', 'A', 'A', 'A', 'A', 'A', 'A'], ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
    ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas'],
    ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ']
  ],
  ,
  [
    ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
    ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
    [
      'Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir',
      'Kṭuber', 'Nwanbir', 'Dujanbir'
    ]
  ],
  , [['ZƐ', 'ḌƐ'], , ['Zdat Ɛisa (TAƔ)', 'Ḍeffir Ɛisa (TAƔ)']], 6, [5, 6],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], 'MAD', 'Derhem Umeṛṛuki',
  function(n: number):
      number {
        if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
          return 1;
        return 5;
      }
];
