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
  global.ng.common.locales['kl'] = [
    'kl',
    [['AM', 'PM'], u, u],
    u,
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['sap', 'ata', 'mar', 'pin', 'sis', 'tal', 'arf'],
      [
        'sapaat', 'ataasinngorneq', 'marlunngorneq', 'pingasunngorneq', 'sisamanngorneq',
        'tallimanngorneq', 'arfininngorneq'
      ],
      ['sap', 'ata', 'mar', 'pin', 'sis', 'tal', 'arf']
    ],
    u,
    [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      ['jan', 'febr', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sept', 'okt', 'nov', 'dec'],
      [
        'januaarip', 'februaarip', 'marsip', 'apriilip', 'maajip', 'juunip', 'juulip', 'aggustip',
        'septembarip', 'oktobarip', 'novembarip', 'decembarip'
      ]
    ],
    [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      ['jan', 'febr', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sept', 'okt', 'nov', 'dec'],
      [
        'januaari', 'februaari', 'marsi', 'apriili', 'maaji', 'juuni', 'juuli', 'aggusti',
        'septembari', 'oktobari', 'novembari', 'decembari'
      ]
    ],
    [['BCE', 'CE'], u, u],
    1,
    [6, 0],
    ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
    ['HH.mm', 'HH.mm.ss', 'HH.mm.ss z', 'HH.mm.ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '¤#,##0.00;¤-#,##0.00', '#E0'],
    'DKK',
    'kr.',
    'DKK',
    {'DKK': ['kr.', 'kr'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
