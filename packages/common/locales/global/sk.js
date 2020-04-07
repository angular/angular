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
    if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return 3;
    if (!(v === 0)) return 4;
    return 5;
  }
  global.ng.common.locales['sk'] = [
    'sk',
    [['AM', 'PM'], u, u],
    u,
    [
      ['n', 'p', 'u', 's', 'š', 'p', 's'], ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
      ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'],
      ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so']
    ],
    u,
    [
      ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
      ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
      [
        'januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta',
        'septembra', 'októbra', 'novembra', 'decembra'
      ]
    ],
    [
      ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
      ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
      [
        'január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september',
        'október', 'november', 'december'
      ]
    ],
    [['pred Kr.', 'po Kr.'], u, ['pred Kristom', 'po Kristovi']],
    1,
    [6, 0],
    ['d. M. y', u, 'd. MMMM y', 'EEEE d. MMMM y'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
    ['{1} {0}', '{1}, {0}', u, u],
    [',', ' ', ';', '%', '+', '-', 'e', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'euro',
    {
      'AUD': [u, '$'],
      'BRL': [u, 'R$'],
      'CAD': [u, '$'],
      'CNY': [u, '¥'],
      'GBP': [u, '£'],
      'HKD': [u, '$'],
      'ILS': ['NIS', '₪'],
      'INR': [u, '₹'],
      'JPY': [u, '¥'],
      'KRW': [u, '₩'],
      'NZD': [u, '$'],
      'TWD': [u, 'NT$'],
      'USD': [u, '$'],
      'VND': [u, '₫'],
      'XXX': []
    },
    'ltr',
    plural,
    [
      [
        ['o poln.', 'nap.', 'ráno', 'dop.', 'pop.', 'več.', 'v n.'],
        ['o poln.', 'napol.', 'ráno', 'dopol.', 'popol.', 'večer', 'v noci'],
        ['o polnoci', 'napoludnie', 'ráno', 'dopoludnia', 'popoludní', 'večer', 'v noci']
      ],
      [
        ['poln.', 'pol.', 'ráno', 'dop.', 'pop.', 'več.', 'noc'],
        ['poln.', 'pol.', 'ráno', 'dopol.', 'popol.', 'večer', 'noc'],
        ['polnoc', 'poludnie', 'ráno', 'dopoludnie', 'popoludnie', 'večer', 'noc']
      ],
      [
        '00:00', '12:00', ['04:00', '09:00'], ['09:00', '12:00'], ['12:00', '18:00'],
        ['18:00', '22:00'], ['22:00', '04:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
