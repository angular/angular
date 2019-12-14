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
    let v = n.toString().replace(/^[^.]*\.?/, '').length,
        f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
    if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
        v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
      return 0;
    if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
        !(v === 2) && f % 10 === 1)
      return 1;
    return 5;
  }
  global.ng.common.locales['lv'] = [
    'lv',
    [['priekšp.', 'pēcp.'], u, ['priekšpusdienā', 'pēcpusdienā']],
    [['priekšp.', 'pēcpusd.'], u, ['priekšpusdiena', 'pēcpusdiena']],
    [
      ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
      ['svētd.', 'pirmd.', 'otrd.', 'trešd.', 'ceturtd.', 'piektd.', 'sestd.'],
      [
        'svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena', 'ceturtdiena', 'piektdiena',
        'sestdiena'
      ],
      ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se']
    ],
    [
      ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
      ['Svētd.', 'Pirmd.', 'Otrd.', 'Trešd.', 'Ceturtd.', 'Piektd.', 'Sestd.'],
      [
        'Svētdiena', 'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena',
        'Sestdiena'
      ],
      ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se']
    ],
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      [
        'janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.',
        'nov.', 'dec.'
      ],
      [
        'janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts',
        'septembris', 'oktobris', 'novembris', 'decembris'
      ]
    ],
    u,
    [['p.m.ē.', 'm.ē.'], u, ['pirms mūsu ēras', 'mūsu ērā']],
    1,
    [6, 0],
    ['dd.MM.yy', 'y. \'gada\' d. MMM', 'y. \'gada\' d. MMMM', 'EEEE, y. \'gada\' d. MMMM'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NS', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'eiro',
    {'AUD': ['AU$', '$'], 'LVL': ['Ls'], 'THB': ['฿'], 'TWD': ['NT$']},
    plural,
    [
      [
        ['pusnaktī', 'pusd.', 'no rīta', 'pēcpusd.', 'vakarā', 'naktī'], u,
        ['pusnaktī', 'pusdienlaikā', 'no rīta', 'pēcpusdienā', 'vakarā', 'naktī']
      ],
      [
        ['pusnakts', 'pusd.', 'rīts', 'pēcpusd.', 'vakars', 'nakts'],
        ['pusnakts', 'pusd.', 'rīts', 'pēcpusdiena', 'vakars', 'nakts'],
        ['pusnakts', 'pusdienlaiks', 'rīts', 'pēcpusdiena', 'vakars', 'nakts']
      ],
      [
        '00:00', '12:00', ['06:00', '12:00'], ['12:00', '18:00'], ['18:00', '23:00'],
        ['23:00', '06:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
