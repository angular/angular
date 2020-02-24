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
    let i = Math.floor(Math.abs(n));
    if (i === Math.floor(i) && i >= 0 && i <= 1) return 1;
    return 5;
  }
  global.ng.common.locales['pt-mz'] = [
    'pt-MZ',
    [['a.m.', 'p.m.'], u, ['da manhã', 'da tarde']],
    [['a.m.', 'p.m.'], u, ['manhã', 'tarde']],
    [
      ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
      [
        'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira',
        'sábado'
      ],
      ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.',
        'dez.'
      ],
      [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
        'outubro', 'novembro', 'dezembro'
      ]
    ],
    u,
    [['a.C.', 'd.C.'], u, ['antes de Cristo', 'depois de Cristo']],
    0,
    [6, 0],
    ['dd/MM/yy', 'dd/MM/y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1}, {0}', u, '{1} \'às\' {0}', u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'MZN',
    'MTn',
    'metical moçambicano',
    {
      'AUD': ['AU$', '$'],
      'JPY': ['JP¥', '¥'],
      'MZN': ['MTn'],
      'PTE': ['​'],
      'RON': [u, 'L'],
      'THB': ['฿'],
      'TWD': ['NT$'],
      'USD': ['US$', '$']
    },
    'ltr',
    plural,
    [
      [
        ['meia-noite', 'meio-dia', 'manhã', 'tarde', 'noite', 'madrugada'],
        ['meia-noite', 'meio-dia', 'da manhã', 'da tarde', 'da noite', 'da madrugada'], u
      ],
      [['meia-noite', 'meio-dia', 'manhã', 'tarde', 'noite', 'madrugada'], u, u],
      [
        '00:00', '12:00', ['06:00', '12:00'], ['12:00', '19:00'], ['19:00', '24:00'],
        ['00:00', '06:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
