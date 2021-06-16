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
  if (n === 0) return 0;
  if (n === 1) return 1;
  return 5;
}
global.ng.common.locales['ksh'] = [
  'ksh',
  [['v.M.', 'n.M.'], u, ['Uhr vörmiddaachs', 'Uhr nommendaachs']],
  [['v.M.', 'n.M.'], u, ['Vörmeddaach', 'Nommendaach']],
  [
    ['S', 'M', 'D', 'M', 'D', 'F', 'S'], ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
    ['Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach', 'Samsdaach'],
    ['Su', 'Mo', 'Di', 'Me', 'Du', 'Fr', 'Sa']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
    ['Jan', 'Fäb', 'Mäz', 'Apr', 'Mai', 'Jun', 'Jul', 'Ouj', 'Säp', 'Okt', 'Nov', 'Dez'],
    [
      'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
      'Oktohber', 'Novämber', 'Dezämber'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
    ['Jan.', 'Fäb.', 'Mäz.', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Ouj.', 'Säp.', 'Okt.', 'Nov.', 'Dez.'],
    [
      'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
      'Oktohber', 'Novämber', 'Dezämber'
    ]
  ],
  [['vC', 'nC'], ['v. Chr.', 'n. Chr.'], ['vür Krestos', 'noh Krestos']],
  1,
  [6, 0],
  ['d. M. y', 'd. MMM. y', 'd. MMMM y', 'EEEE, \'dä\' d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '−', '×10^', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'Euro',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural,
  []
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
