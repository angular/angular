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
  let i = Math.floor(Math.abs(n));
  if (i === Math.floor(i) && i >= 0 && i <= 1) return 1;
  return 5;
}

export default [
  'pt-AO',
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
      'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
    ],
    [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
      'outubro', 'novembro', 'dezembro'
    ]
  ],
  u,
  [['a.C.', 'd.C.'], u, ['antes de Cristo', 'depois de Cristo']],
  1,
  [6, 0],
  ['dd/MM/yy', 'dd/MM/y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} \'às\' {0}', u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'AOA',
  'Kz',
  'kwanza angolano',
  {
    'AOA': ['Kz'],
    'AUD': ['AU$', '$'],
    'JPY': ['JP¥', '¥'],
    'PTE': ['​'],
    'RON': [u, 'L'],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'USD': ['US$', '$']
  },
  'ltr',
  plural
];
