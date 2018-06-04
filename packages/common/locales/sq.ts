/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  'sq', [['e paradites', 'e pasdites'], u, u], [['paradite', 'pasdite'], u, u],
  [
    ['D', 'H', 'M', 'M', 'E', 'P', 'Sh'], ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
    ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'],
    ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht']
  ],
  [
    ['D', 'H', 'M', 'M', 'E', 'P', 'Sh'], ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
    ['E diel', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë'],
    ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht']
  ],
  [
    ['j', 'sh', 'm', 'p', 'm', 'q', 'k', 'g', 'sh', 't', 'n', 'dh'],
    ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
    [
      'janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor',
      'nëntor', 'dhjetor'
    ]
  ],
  [
    ['J', 'Sh', 'M', 'P', 'M', 'Q', 'K', 'G', 'Sh', 'T', 'N', 'Dh'],
    ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Korr', 'Gush', 'Sht', 'Tet', 'Nën', 'Dhj'],
    [
      'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor',
      'Nëntor', 'Dhjetor'
    ]
  ],
  [['p.K.', 'mb.K.'], u, ['para Krishtit', 'mbas Krishtit']], 1, [6, 0],
  ['d.M.yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a, z', 'h:mm:ss a, zzzz'], ['{1}, {0}', u, '{1} \'në\' {0}', u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], 'Lekë', 'Leku shqiptar',
  {'ALL': ['Lekë'], 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'USD': ['US$', '$']}, plural
];
