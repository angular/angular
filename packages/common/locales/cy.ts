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
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  if (n === 6) return 4;
  return 5;
}

export default [
  'cy',
  [['b', 'h'], ['AM', 'PM'], ['yb', 'yh']],
  [['AM', 'PM'], u, u],
  [
    ['S', 'Ll', 'M', 'M', 'I', 'G', 'S'], ['Sul', 'Llun', 'Maw', 'Mer', 'Iau', 'Gwen', 'Sad'],
    [
      'Dydd Sul', 'Dydd Llun', 'Dydd Mawrth', 'Dydd Mercher', 'Dydd Iau', 'Dydd Gwener',
      'Dydd Sadwrn'
    ],
    ['Su', 'Ll', 'Ma', 'Me', 'Ia', 'Gw', 'Sa']
  ],
  [
    ['S', 'Ll', 'M', 'M', 'I', 'G', 'S'], ['Sul', 'Llun', 'Maw', 'Mer', 'Iau', 'Gwe', 'Sad'],
    [
      'Dydd Sul', 'Dydd Llun', 'Dydd Mawrth', 'Dydd Mercher', 'Dydd Iau', 'Dydd Gwener',
      'Dydd Sadwrn'
    ],
    ['Su', 'Ll', 'Ma', 'Me', 'Ia', 'Gw', 'Sa']
  ],
  [
    ['I', 'Ch', 'M', 'E', 'M', 'M', 'G', 'A', 'M', 'H', 'T', 'Rh'],
    ['Ion', 'Chwef', 'Maw', 'Ebr', 'Mai', 'Meh', 'Gorff', 'Awst', 'Medi', 'Hyd', 'Tach', 'Rhag'],
    [
      'Ionawr', 'Chwefror', 'Mawrth', 'Ebrill', 'Mai', 'Mehefin', 'Gorffennaf', 'Awst', 'Medi',
      'Hydref', 'Tachwedd', 'Rhagfyr'
    ]
  ],
  [
    ['I', 'Ch', 'M', 'E', 'M', 'M', 'G', 'A', 'M', 'H', 'T', 'Rh'],
    ['Ion', 'Chw', 'Maw', 'Ebr', 'Mai', 'Meh', 'Gor', 'Awst', 'Medi', 'Hyd', 'Tach', 'Rhag'],
    [
      'Ionawr', 'Chwefror', 'Mawrth', 'Ebrill', 'Mai', 'Mehefin', 'Gorffennaf', 'Awst', 'Medi',
      'Hydref', 'Tachwedd', 'Rhagfyr'
    ]
  ],
  [['C', 'O'], ['CC', 'OC'], ['Cyn Crist', 'Oed Crist']],
  1,
  [6, 0],
  ['dd/MM/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, '{1} \'am\' {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'GBP',
  '£',
  'Punt Prydain',
  {
    'BDT': [u, 'TK'],
    'BWP': [],
    'HKD': ['HK$'],
    'JPY': ['JP¥', '¥'],
    'KRW': [u, '₩'],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'USD': ['US$', '$'],
    'XXX': [],
    'ZAR': [],
    'ZMW': []
  },
  'ltr',
  plural
];
