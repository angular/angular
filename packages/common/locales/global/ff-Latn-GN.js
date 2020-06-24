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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || i === 1) return 1;
  return 5;
}
global.ng.common.locales['ff-latn-gn'] = [
  'ff-Latn-GN',
  [['subaka', 'kikiiɗe'], u, u],
  u,
  [
    ['d', 'a', 'm', 'n', 'n', 'm', 'h'], ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
    ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
    ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi']
  ],
  u,
  [
    ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
    ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
    [
      'siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa',
      'jolal', 'bowte'
    ]
  ],
  u,
  [['H-I', 'C-I'], u, ['Hade Iisa', 'Caggal Iisa']],
  1,
  [6, 0],
  ['d/M/y', 'd MMM, y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'GNF',
  'FG',
  'GNF',
  {'GNF': ['FG'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural,
  []
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
