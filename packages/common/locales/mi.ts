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
  return 5;
}

export default [
  'mi',
  [['AM', 'PM'], u, u],
  u,
  [
    ['T', 'H', 'T', 'A', 'P', 'M', 'H'], ['Tap', 'Hin', 'Tū', 'Apa', 'Par', 'Mer', 'Hor'],
    ['Rātapu', 'Rāhina', 'Rātū', 'Rāapa', 'Rāpare', 'Rāmere', 'Rāhoroi'],
    ['Tap', 'Hin', 'Tū', 'Apa', 'Par', 'Mer', 'Hor']
  ],
  u,
  [
    ['K', 'H', 'P', 'P', 'H', 'P', 'H', 'H', 'M', 'N', 'R', 'H'],
    ['Kohi', 'Hui', 'Pou', 'Pae', 'Hara', 'Pipi', 'Hōngo', 'Here', 'Mahu', 'Nuku', 'Rangi', 'Haki'],
    [
      'Kohitātea', 'Huitanguru', 'Poutūterangi', 'Paengawhāwhā', 'Haratua', 'Pipiri', 'Hōngongoi',
      'Hereturikōkā', 'Mahuru', 'Whiringa-ā-nuku', 'Whiringa-ā-rangi', 'Hakihea'
    ]
  ],
  u,
  [['BCE', 'CE'], u, u],
  1,
  [6, 0],
  ['dd-MM-y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'NZD',
  '$',
  'Tāra o Aotearoa',
  {'NZD': ['$'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
