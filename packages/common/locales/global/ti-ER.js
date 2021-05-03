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
  if (n === Math.floor(n) && n >= 0 && n <= 1) return 1;
  return 5;
}
global.ng.common.locales['ti-er'] = [
  'ti-ER',
  [['ንጉሆ ሰዓተ', 'ድሕር ሰዓት'], u, u],
  u,
  [
    ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'], ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
    ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም'], ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ']
  ],
  u,
  [
    ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
    ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
    ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ']
  ],
  u,
  [['ዓ/ዓ', 'ዓ/ም'], u, ['ዓመተ ዓለም', 'ዓመተ ምህረት']],
  1,
  [6, 0],
  ['dd/MM/yy', 'dd-MMM-y', 'dd MMMM y', 'EEEE፣ dd MMMM መዓልቲ y G'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'ERN',
  'Nfk',
  'ERN',
  {'ERN': ['Nfk'], 'ETB': ['Br'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural,
  []
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
