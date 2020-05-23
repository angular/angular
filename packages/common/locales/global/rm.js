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
  global.ng.common.locales['rm'] = [
    'rm',
    [['AM', 'PM'], u, u],
    u,
    [
      ['D', 'G', 'M', 'M', 'G', 'V', 'S'], ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
      ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda'],
      ['du', 'gli', 'ma', 'me', 'gie', 've', 'so']
    ],
    u,
    [
      ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
      [
        'schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.',
        'nov.', 'dec.'
      ],
      [
        'da schaner', 'da favrer', 'da mars', 'd’avrigl', 'da matg', 'da zercladur', 'da fanadur',
        'd’avust', 'da settember', 'd’october', 'da november', 'da december'
      ]
    ],
    [
      ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
      [
        'schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.',
        'nov.', 'dec.'
      ],
      [
        'schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember',
        'october', 'november', 'december'
      ]
    ],
    [['av. Cr.', 's. Cr.'], u, ['avant Cristus', 'suenter Cristus']],
    1,
    [6, 0],
    ['dd-MM-yy', 'dd-MM-y', 'd MMMM y', 'EEEE, \'ils\' d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', '’', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'CHF',
    'CHF',
    'franc svizzer',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
