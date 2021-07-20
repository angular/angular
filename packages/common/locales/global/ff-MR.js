/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// **Note**: Locale files are generated through Bazel and never part of the sources. This is an
// exception for backwards compatibility. With the Gulp setup we never deleted old locale files
// when updating CLDR, so older locale files which have been removed, or renamed in the CLDR
// data remained in the repository. We keep these files checked-in until the next major to avoid
// potential breaking changes. It's worth noting that the locale data for such files is outdated
// anyway. e.g. the data is missing the directionality, throwing off the indices.

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
root.ng.common.locales['ff-mr'] = [
  'ff-MR',
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
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'UM',
  'Ugiyya Muritani',
  {'JPY': ['JP¥', '¥'], 'MRU': ['UM'], 'USD': ['US$', '$']},
  plural,
  []
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
