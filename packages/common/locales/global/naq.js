/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(function(global) {
  global.ng = global.ng || {};
  global.ng.common = global.ng.common || {};
  global.ng.common.locales = global.ng.common.locales || {};
  const u = undefined;
  function plural(n) {
    if (n === 1) return 1;
    if (n === 2) return 2;
    return 5;
  }
  global.ng.common.locales['naq'] = [
    'naq',
    [['ǁgoagas', 'ǃuias'], u, u],
    u,
    [
      ['S', 'M', 'E', 'W', 'D', 'F', 'A'], ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
      [
        'Sontaxtsees', 'Mantaxtsees', 'Denstaxtsees', 'Wunstaxtsees', 'Dondertaxtsees',
        'Fraitaxtsees', 'Satertaxtsees'
      ],
      ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [
        'ǃKhanni', 'ǃKhanǀgôab', 'ǀKhuuǁkhâb', 'ǃHôaǂkhaib', 'ǃKhaitsâb', 'Gamaǀaeb',
        'ǂKhoesaob', 'Aoǁkhuumûǁkhâb', 'Taraǀkhuumûǁkhâb', 'ǂNûǁnâiseb', 'ǀHooǂgaeb',
        'Hôasoreǁkhâb'
      ]
    ],
    u,
    [['BC', 'AD'], u, ['Xristub aiǃâ', 'Xristub khaoǃgâ']],
    1,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
    'ZAR',
    'ZAR',
    'South African Randi',
    {'JPY': ['JP¥', '¥'], 'NAD': ['$'], 'USD': ['US$', '$']},
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
