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
    let i = Math.floor(Math.abs(n));
    if (i === 0 || n === 1) return 1;
    if (n === Math.floor(n) && n >= 2 && n <= 10) return 3;
    return 5;
  }
  global.ng.common.locales['shi-tfng'] = [
    'shi-Tfng',
    [['ⵜⵉⴼⴰⵡⵜ', 'ⵜⴰⴷⴳⴳⵯⴰⵜ'], u, u],
    u,
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      [
        'ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ',
        'ⴰⵙⵉⴹ'
      ],
      [
        'ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ',
        'ⴰⴽⵡⴰⵙ', 'ⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'
      ],
      [
        'ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ',
        'ⴰⵙⵉⴹ'
      ]
    ],
    u,
    [
      ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
      [
        'ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ',
        'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'
      ],
      [
        'ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ',
        'ⵎⴰⵢⵢⵓ', 'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ',
        'ⵛⵓⵜⴰⵏⴱⵉⵔ', 'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ',
        'ⴷⵓⵊⴰⵏⴱⵉⵔ'
      ]
    ],
    u,
    [
      ['ⴷⴰⵄ', 'ⴷⴼⵄ'], u,
      ['ⴷⴰⵜ ⵏ ⵄⵉⵙⴰ', 'ⴷⴼⴼⵉⵔ ⵏ ⵄⵉⵙⴰ']
    ],
    1,
    [6, 0],
    ['d/M/y', 'd MMM, y', 'd MMMM y', 'EEEE d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'],
    'MAD',
    'MAD',
    'ⴰⴷⵔⵉⵎ ⵏ ⵍⵎⵖⵔⵉⴱ',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
