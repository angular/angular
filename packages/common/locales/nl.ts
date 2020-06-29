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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return 1;
  return 5;
}

export default [
  'nl',
  [['a.m.', 'p.m.'], u, u],
  u,
  [
    ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'], ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
    ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
    [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september',
      'oktober', 'november', 'december'
    ]
  ],
  u,
  [['v.C.', 'n.C.'], ['v.Chr.', 'n.Chr.'], ['voor Christus', 'na Christus']],
  1,
  [6, 0],
  ['dd-MM-y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, '{1} \'om\' {0}', u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00;¤ -#,##0.00', '#E0'],
  'EUR',
  '€',
  'Euro',
  {
    'AUD': ['AU$', '$'],
    'CAD': ['C$', '$'],
    'FJD': ['FJ$', '$'],
    'JPY': ['JP¥', '¥'],
    'SBD': ['SI$', '$'],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'USD': ['US$', '$'],
    'XPF': [],
    'XXX': []
  },
  'ltr',
  plural
];
