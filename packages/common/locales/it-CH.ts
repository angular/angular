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
  'it-CH',
  [['m.', 'p.'], ['AM', 'PM'], u],
  u,
  [
    ['D', 'L', 'M', 'M', 'G', 'V', 'S'], ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
    ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
    ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
  ],
  u,
  [
    ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
    ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    [
      'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre',
      'ottobre', 'novembre', 'dicembre'
    ]
  ],
  u,
  [['aC', 'dC'], ['a.C.', 'd.C.'], ['avanti Cristo', 'dopo Cristo']],
  1,
  [6, 0],
  ['dd.MM.yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} {0}', u],
  ['.', '’', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00;¤-#,##0.00', '#E0'],
  'CHF',
  'CHF',
  'franco svizzero',
  {
    'BRL': [u, 'R$'],
    'BYN': [u, 'Br'],
    'EGP': [u, '£E'],
    'HKD': [u, '$'],
    'JPY': [u, '¥'],
    'KRW': [u, '₩'],
    'MXN': [u, '$'],
    'NOK': [u, 'NKr'],
    'THB': ['฿'],
    'TWD': [u, 'NT$'],
    'USD': [u, '$']
  },
  'ltr',
  plural
];
