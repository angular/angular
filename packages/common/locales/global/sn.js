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
  global.ng.common.locales['sn'] = [
    'sn',
    [['a', 'p'], ['AM', 'PM'], u],
    [['AM', 'PM'], u, u],
    [
      ['S', 'M', 'C', 'C', 'C', 'C', 'M'], ['Svo', 'Muv', 'Chp', 'Cht', 'Chn', 'Chs', 'Mug'],
      ['Svondo', 'Muvhuro', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugovera'],
      ['Sv', 'Mu', 'Cp', 'Ct', 'Cn', 'Cs', 'Mg']
    ],
    u,
    [
      ['N', 'K', 'K', 'K', 'C', 'C', 'C', 'N', 'G', 'G', 'M', 'Z'],
      ['Ndi', 'Kuk', 'Kur', 'Kub', 'Chv', 'Chk', 'Chg', 'Nya', 'Gun', 'Gum', 'Mbu', 'Zvi'],
      [
        'Ndira', 'Kukadzi', 'Kurume', 'Kubvumbi', 'Chivabvu', 'Chikumi', 'Chikunguru',
        'Nyamavhuvhu', 'Gunyana', 'Gumiguru', 'Mbudzi', 'Zvita'
      ]
    ],
    u,
    [['BC', 'AD'], u, ['Kristo asati auya', 'mugore ramambo vedu']],
    0,
    [6, 0],
    ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
    'USD',
    'US$',
    'Dora re Amerika',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
