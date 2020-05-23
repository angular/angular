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
    let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
    if (i === 1 && v === 0) return 1;
    return 5;
  }
  global.ng.common.locales['sv'] = [
    'sv',
    [['fm', 'em'], u, u],
    [['fm', 'em'], ['f.m.', 'e.m.'], ['förmiddag', 'eftermiddag']],
    [
      ['S', 'M', 'T', 'O', 'T', 'F', 'L'], ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
      ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
      ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      [
        'jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.',
        'dec.'
      ],
      [
        'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september',
        'oktober', 'november', 'december'
      ]
    ],
    u,
    [['f.Kr.', 'e.Kr.'], u, ['före Kristus', 'efter Kristus']],
    1,
    [6, 0],
    ['y-MM-dd', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', '\'kl\'. HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '−', '×10^', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'SEK',
    'kr',
    'svensk krona',
    {
      'AUD': [u, '$'],
      'BBD': ['Bds$', '$'],
      'BMD': ['BM$', '$'],
      'BRL': ['BR$', 'R$'],
      'BSD': ['BS$', '$'],
      'BZD': ['BZ$', '$'],
      'CNY': [u, '¥'],
      'DKK': ['Dkr', 'kr'],
      'DOP': ['RD$', '$'],
      'EEK': ['Ekr'],
      'EGP': ['EG£', 'E£'],
      'ESP': [],
      'GBP': [u, '£'],
      'HKD': [u, '$'],
      'IEP': ['IE£'],
      'INR': [u, '₹'],
      'ISK': ['Ikr', 'kr'],
      'JMD': ['JM$', '$'],
      'JPY': [u, '¥'],
      'KRW': [u, '₩'],
      'NOK': ['Nkr', 'kr'],
      'NZD': [u, '$'],
      'RON': [u, 'L'],
      'SEK': ['kr'],
      'TWD': [u, 'NT$'],
      'USD': ['US$', '$'],
      'VND': [u, '₫']
    },
    'ltr',
    plural,
    [
      [
        ['midn.', 'på morg.', 'på förm.', 'på efterm.', 'på kvällen', 'på natten'],
        ['midnatt', 'på morg.', 'på förm.', 'på efterm.', 'på kvällen', 'på natten'],
        [
          'midnatt', 'på morgonen', 'på förmiddagen', 'på eftermiddagen', 'på kvällen',
          'på natten'
        ]
      ],
      [
        ['midn.', 'morg.', 'förm.', 'efterm.', 'kväll', 'natt'],
        ['midnatt', 'morgon', 'förm.', 'efterm.', 'kväll', 'natt'],
        ['midnatt', 'morgon', 'förmiddag', 'eftermiddag', 'kväll', 'natt']
      ],
      [
        '00:00', ['05:00', '10:00'], ['10:00', '12:00'], ['12:00', '18:00'], ['18:00', '24:00'],
        ['00:00', '05:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
