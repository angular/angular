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
  global.ng.common.locales['es'] = [
    'es',
    [['a. m.', 'p. m.'], u, u],
    u,
    [
      ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
      ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']
    ],
    u,
    [
      ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      [
        'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.',
        'dic.'
      ],
      [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
        'octubre', 'noviembre', 'diciembre'
      ]
    ],
    u,
    [['a. C.', 'd. C.'], u, ['antes de Cristo', 'después de Cristo']],
    1,
    [6, 0],
    ['d/M/yy', 'd MMM y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss (zzzz)'],
    ['{1} {0}', u, '{1}, {0}', u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'euro',
    {
      'AUD': [u, '$'],
      'BRL': [u, 'R$'],
      'CNY': [u, '¥'],
      'EGP': [],
      'ESP': ['₧'],
      'GBP': [u, '£'],
      'HKD': [u, '$'],
      'ILS': [u, '₪'],
      'INR': [u, '₹'],
      'JPY': [u, '¥'],
      'KRW': [u, '₩'],
      'MXN': [u, '$'],
      'NZD': [u, '$'],
      'RON': [u, 'L'],
      'THB': ['฿'],
      'TWD': [u, 'NT$'],
      'USD': ['US$', '$'],
      'XAF': [],
      'XCD': [u, '$'],
      'XOF': []
    },
    plural,
    [
      [['del mediodía', 'de la madrugada', 'de la mañana', 'de la tarde', 'de la noche'], u, u],
      [['mediodía', 'madrugada', 'mañana', 'tarde', 'noche'], u, u],
      ['12:00', ['00:00', '06:00'], ['06:00', '12:00'], ['12:00', '20:00'], ['20:00', '24:00']]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
