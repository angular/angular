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
global.ng.common.locales['bem'] = [
  'bem',
  [['uluchelo', 'akasuba'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    [
      'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
      'Pachibelushi'
    ],
    u, u
  ],
  u,
  [
    ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mac', 'Epr', 'Mei', 'Jun', 'Jul', 'Oga', 'Sep', 'Okt', 'Nov', 'Dis'],
    [
      'Januari', 'Februari', 'Machi', 'Epreo', 'Mei', 'Juni', 'Julai', 'Ogasti', 'Septemba',
      'Oktoba', 'Novemba', 'Disemba'
    ]
  ],
  u,
  [['BC', 'AD'], u, ['Before Yesu', 'After Yesu']],
  1,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'ZMW',
  'K',
  'ZMW',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'], 'ZMW': ['K', 'ZK']},
  'ltr',
  plural,
  []
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
