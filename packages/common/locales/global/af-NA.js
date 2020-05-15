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
global.ng.common.locales['af-na'] = [
  'af-NA',
  [['v', 'n'], ['vm.', 'nm.'], u],
  u,
  [
    ['S', 'M', 'D', 'W', 'D', 'V', 'S'], ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
    ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'],
    ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Des.'],
    [
      'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September',
      'Oktober', 'November', 'Desember'
    ]
  ],
  u,
  [['v.C.', 'n.C.'], u, ['voor Christus', 'na Christus']],
  1,
  [6, 0],
  ['y-MM-dd', 'dd MMM y', 'dd MMMM y', 'EEEE dd MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'ZAR',
  'R',
  'Suid-Afrikaanse rand',
  {
    'CAD': [u, '$'],
    'JPY': ['JP¥', '¥'],
    'MXN': [u, '$'],
    'NAD': ['$'],
    'RON': [u, 'leu'],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'USD': [u, '$'],
    'ZAR': ['R']
  },
  'ltr',
  plural,
  [
    [
      ['mn', 'o', 'm', 'a', 'n'], ['middernag', 'die oggend', 'die middag', 'die aand', 'die nag'],
      u
    ],
    [['mn', 'o', 'm', 'a', 'n'], ['middernag', 'oggend', 'middag', 'aand', 'nag'], u],
    ['00:00', ['05:00', '12:00'], ['12:00', '18:00'], ['18:00', '24:00'], ['00:00', '05:00']]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
