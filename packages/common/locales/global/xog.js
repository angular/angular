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
    return 5;
  }
  global.ng.common.locales['xog'] = [
    'xog',
    [['Munkyo', 'Eigulo'], u, u],
    u,
    [
      ['S', 'B', 'B', 'S', 'K', 'K', 'M'], ['Sabi', 'Bala', 'Kubi', 'Kusa', 'Kuna', 'Kuta', 'Muka'],
      ['Sabiiti', 'Balaza', 'Owokubili', 'Owokusatu', 'Olokuna', 'Olokutaanu', 'Olomukaaga'],
      ['Sabi', 'Bala', 'Kubi', 'Kusa', 'Kuna', 'Kuta', 'Muka']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
      [
        'Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito',
        'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'
      ]
    ],
    u,
    [['AZ', 'AF'], u, ['Kulisto nga azilawo', 'Kulisto nga affile']],
    1,
    [0, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'UGX',
    'USh',
    'Silingi eya Yuganda',
    {'JPY': ['JP¥', '¥'], 'UGX': ['USh'], 'USD': ['US$', '$']},
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
