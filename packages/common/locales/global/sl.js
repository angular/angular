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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (v === 0 && i % 100 === 1) return 1;
  if (v === 0 && i % 100 === 2) return 2;
  if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
    return 3;
  return 5;
}
global.ng.common.locales['sl'] = [
  'sl',
  [['d', 'p'], ['dop.', 'pop.'], u],
  [['d', 'p'], ['dop.', 'pop.'], ['dopoldne', 'popoldne']],
  [
    ['n', 'p', 't', 's', 'č', 'p', 's'], ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
    ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota'],
    ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.']
  ],
  u,
  [
    ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
    ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
    [
      'januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september',
      'oktober', 'november', 'december'
    ]
  ],
  u,
  [['pr. Kr.', 'po Kr.'], u, ['pred Kristusom', 'po Kristusu']],
  1,
  [6, 0],
  ['d. MM. yy', 'd. MMM y', 'dd. MMMM y', 'EEEE, dd. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '−', 'e', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'evro',
  {
    'AUD': [u, '$'],
    'BRL': [u, 'R$'],
    'CAD': [u, '$'],
    'GBP': [u, '£'],
    'MXN': [u, '$'],
    'NZD': [u, '$'],
    'TWD': [u, 'NT$'],
    'XCD': [u, '$']
  },
  'ltr',
  plural,
  [
    [
      ['24.00', '12.00', 'zj', 'd', 'p', 'zv', 'po'],
      ['opoln.', 'opold.', 'zjut.', 'dop.', 'pop.', 'zveč.', 'ponoči'],
      ['opolnoči', 'opoldne', 'zjutraj', 'dopoldan', 'popoldan', 'zvečer', 'ponoči']
    ],
    [
      ['24.00', '12.00', 'j', 'd', 'p', 'v', 'n'],
      ['poln.', 'pold.', 'jut.', 'dop.', 'pop.', 'zveč.', 'noč'],
      ['polnoč', 'poldne', 'jutro', 'dopoldne', 'popoldne', 'večer', 'noč']
    ],
    [
      '00:00', '12:00', ['06:00', '10:00'], ['10:00', '12:00'], ['12:00', '18:00'],
      ['18:00', '22:00'], ['22:00', '06:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
