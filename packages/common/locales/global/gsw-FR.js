/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
global.ng.common.locales['gsw-fr'] = [
  'gsw-FR',
  [['vorm.', 'nam.'], u, ['am Vormittag', 'am Namittag']],
  [['vorm.', 'nam.'], u, ['Vormittag', 'Namittag']],
  [
    ['S', 'M', 'D', 'M', 'D', 'F', 'S'], ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
    ['Sunntig', 'Määntig', 'Ziischtig', 'Mittwuch', 'Dunschtig', 'Friitig', 'Samschtig'],
    ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Auguscht', 'Septämber',
      'Oktoober', 'Novämber', 'Dezämber'
    ]
  ],
  u,
  [['v. Chr.', 'n. Chr.'], u, u],
  1,
  [6, 0],
  ['dd.MM.yy', 'dd.MM.y', 'd. MMMM y', 'EEEE, d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', '’', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'Euro',
  {'ATS': ['öS']},
  'ltr',
  plural,
  [
    [['Mitternacht', 'am Morge', 'zmittag', 'am Namittag', 'zaabig', 'znacht'], u, u],
    [
      ['Mitternacht', 'am Morge', 'zmittag', 'am Namittag', 'zaabig', 'znacht'], u,
      ['Mitternacht', 'Morge', 'Mittag', 'Namittag', 'Aabig', 'Nacht']
    ],
    [
      '00:00', ['05:00', '12:00'], ['12:00', '14:00'], ['14:00', '18:00'], ['18:00', '24:00'],
      ['00:00', '05:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
