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
  'eu',
  [['g', 'a'], ['AM', 'PM'], u],
  [['AM', 'PM'], u, u],
  [
    ['I', 'A', 'A', 'A', 'O', 'O', 'L'], ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.'],
    ['igandea', 'astelehena', 'asteartea', 'asteazkena', 'osteguna', 'ostirala', 'larunbata'],
    ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.']
  ],
  u,
  [
    ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U', 'A', 'A'],
    [
      'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.', 'abe.'
    ],
    [
      'urtarrilak', 'otsailak', 'martxoak', 'apirilak', 'maiatzak', 'ekainak', 'uztailak',
      'abuztuak', 'irailak', 'urriak', 'azaroak', 'abenduak'
    ]
  ],
  [
    ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U', 'A', 'A'],
    [
      'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.', 'abe.'
    ],
    [
      'urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua',
      'iraila', 'urria', 'azaroa', 'abendua'
    ]
  ],
  [['K.a.', 'K.o.'], u, ['K.a.', 'Kristo ondoren']],
  1,
  [6, 0],
  [
    'yy/M/d', 'y(\'e\')\'ko\' MMM d(\'a\')', 'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\')',
    'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\'), EEEE'
  ],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss (z)', 'HH:mm:ss (zzzz)'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '% #,##0', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'euroa',
  {'ESP': ['₧'], 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
