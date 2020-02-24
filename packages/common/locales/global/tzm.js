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
    if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
      return 1;
    return 5;
  }
  global.ng.common.locales['tzm'] = [
    'tzm',
    [['Zdat azal', 'Ḍeffir aza'], u, u],
    u,
    [
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'], ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
      ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas'],
      ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ']
    ],
    u,
    [
      ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
      ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
      [
        'Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir',
        'Kṭuber', 'Nwanbir', 'Dujanbir'
      ]
    ],
    u,
    [['ZƐ', 'ḌƐ'], u, ['Zdat Ɛisa (TAƔ)', 'Ḍeffir Ɛisa (TAƔ)']],
    1,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'MAD',
    'MAD',
    'Derhem Umeṛṛuki',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
