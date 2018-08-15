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
  'de-AT',
  [['AM', 'PM'], u, u],
  [['vm.', 'nm.'], ['AM', 'PM'], u],
  [
    ['S', 'M', 'D', 'M', 'D', 'F', 'S'], ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
    ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  ],
  [
    ['S', 'M', 'D', 'M', 'D', 'F', 'S'], ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
    [
      'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober',
      'November', 'Dezember'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    [
      'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober',
      'November', 'Dezember'
    ]
  ],
  [['v. Chr.', 'n. Chr.'], u, u],
  1,
  [6, 0],
  ['dd.MM.yy', 'dd.MM.y', 'd. MMMM y', 'EEEE, d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} \'um\' {0}', u],
  [',', ' ', ';', '%', '+', '-', 'E', '·', '‰', '∞', 'NaN', ':', u, '.'],
  ['#,##0.###', '#,##0 %', '¤ #,##0.00', '#E0'],
  'EUR',
  '€',
  'Euro',
  {
    'ATS': ['öS'],
    'AUD': ['AU$', '$'],
    'BGM': ['BGK'],
    'BGO': ['BGJ'],
    'CUC': [u, 'Cub$'],
    'DEM': ['DM'],
    'FKP': [u, 'Fl£'],
    'GNF': [u, 'F.G.'],
    'KMF': [u, 'FC'],
    'RON': [u, 'L'],
    'RWF': [u, 'F.Rw'],
    'SYP': [],
    'THB': ['฿'],
    'TWD': ['NT$'],
    'XXX': [],
    'ZMW': [u, 'K']
  },
  'ltr',
  plural
];
