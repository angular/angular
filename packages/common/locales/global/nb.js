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
global.ng.common.locales['nb'] = [
  'nb',
  [['a', 'p'], ['a.m.', 'p.m.'], u],
  [['a.m.', 'p.m.'], u, u],
  [
    ['S', 'M', 'T', 'O', 'T', 'F', 'L'], ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
    ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
    ['sø.', 'ma.', 'ti.', 'on.', 'to.', 'fr.', 'lø.']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
    [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
    [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [['f.Kr.', 'e.Kr.'], u, ['før Kristus', 'etter Kristus']],
  1,
  [6, 0],
  ['dd.MM.y', 'd. MMM y', 'd. MMMM y', 'EEEE d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} \'kl\'. {0}', '{1} {0}'],
  [',', ' ', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '¤ #,##0.00', '#E0'],
  'NOK',
  'kr',
  'norske kroner',
  {
    'AUD': [u, '$'],
    'BRL': [u, 'R$'],
    'CAD': [u, '$'],
    'CNY': [u, '¥'],
    'HKD': [u, '$'],
    'ILS': [u, '₪'],
    'INR': [u, '₹'],
    'JPY': [u, '¥'],
    'KRW': [u, '₩'],
    'MXN': [u, '$'],
    'NOK': ['kr'],
    'NZD': [u, '$'],
    'RON': [u, 'L'],
    'TWD': [u, 'NT$'],
    'USD': [u, '$'],
    'VND': [u, '₫'],
    'XAF': [],
    'XCD': [u, '$'],
    'XPF': [],
    'XXX': []
  },
  'ltr',
  plural,
  [
    [
      ['mn.', 'mg.', 'fm.', 'em.', 'kv.', 'nt.'],
      ['midn.', 'morg.', 'form.', 'etterm.', 'kveld', 'natt'],
      ['midnatt', 'morgenen', 'formiddagen', 'ettermiddagen', 'kvelden', 'natten']
    ],
    [
      ['mn.', 'mg.', 'fm.', 'em.', 'kv.', 'nt.'],
      ['midn.', 'morg.', 'form.', 'etterm.', 'kveld', 'natt'],
      ['midnatt', 'morgen', 'formiddag', 'ettermiddag', 'kveld', 'natt']
    ],
    [
      '00:00', ['06:00', '10:00'], ['10:00', '12:00'], ['12:00', '18:00'], ['18:00', '24:00'],
      ['00:00', '06:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
