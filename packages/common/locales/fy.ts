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
  'fy',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
    ['snein', 'moandei', 'tiisdei', 'woansdei', 'tongersdei', 'freed', 'sneon'],
    ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Feb', 'Mrt', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
    [
      'Jannewaris', 'Febrewaris', 'Maart', 'April', 'Maaie', 'Juny', 'July', 'Augustus',
      'Septimber', 'Oktober', 'Novimber', 'Desimber'
    ]
  ],
  u,
  [['f.K.', 'n.K.'], ['f.Kr.', 'n.Kr.'], ['Foar Kristus', 'nei Kristus']],
  1,
  [6, 0],
  ['dd-MM-yy', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, '{1} \'om\' {0}', u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00;¤ #,##0.00-', '#E0'],
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
    'USD': ['US$', '$'],
    'XPF': []
  },
  'ltr',
  plural
];
