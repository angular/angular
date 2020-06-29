/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  if (n === 1) return 1;
  return 5;
}

export default [
  'es-MX',
  [['a. m.', 'p. m.'], u, u],
  u,
  [
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
    ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']
  ],
  u,
  [
    ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    [
      'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'
    ],
    [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
      'octubre', 'noviembre', 'diciembre'
    ]
  ],
  u,
  [['a. C.', 'd. C.'], u, ['antes de Cristo', 'después de Cristo']],
  0,
  [6, 0],
  ['dd/MM/yy', 'd MMM y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  ['{1} {0}', u, '{1} \'a\' \'las\' {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '¤#,##0.00', '#E0'],
  'MXN',
  '$',
  'peso mexicano',
  {
    'AUD': [u, '$'],
    'BRL': [u, 'R$'],
    'BYN': [u, 'p.'],
    'CAD': [u, '$'],
    'CNY': [u, '¥'],
    'ESP': ['₧'],
    'EUR': [u, '€'],
    'GBP': [u, '£'],
    'HKD': [u, '$'],
    'ILS': [u, '₪'],
    'INR': [u, '₹'],
    'JPY': [u, '¥'],
    'KRW': [u, '₩'],
    'MRO': ['MRU'],
    'MRU': ['UM'],
    'MXN': ['$'],
    'NZD': [u, '$'],
    'TWD': [u, 'NT$'],
    'USD': [u, '$'],
    'VND': [u, '₫'],
    'XAF': [],
    'XCD': [u, '$'],
    'XOF': []
  },
  'ltr',
  plural
];
