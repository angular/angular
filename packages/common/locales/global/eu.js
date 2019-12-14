/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(function(global) {
  global.ng = global.ng || {};
  global.ng.common = global.ng.common || {};
  global.ng.common.locales = global.ng.common.locales || {};
  const u = undefined;
  function plural(n) {
    if (n === 1) return 1;
    return 5;
  }
  global.ng.common.locales['eu'] = [
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
        'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.',
        'abe.'
      ],
      [
        'urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua',
        'iraila', 'urria', 'azaroa', 'abendua'
      ]
    ],
    u,
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
    plural,
    [
      [
        ['gauerdia', 'goizald.', 'goizeko', 'eguerd.', 'arrats.', 'iluntz.', 'gaueko'], u,
        ['gauerdia', 'goizaldeko', 'goizeko', 'eguerdiko', 'arratsaldeko', 'iluntzeko', 'gaueko']
      ],
      [
        ['gauerdia', 'goizald.', 'goiza', 'eguerd.', 'arrats.', 'iluntz.', 'gaua'],
        ['gauerdia', 'goiz.', 'goiza', 'eguerd.', 'arrats.', 'iluntz.', 'gaua'],
        ['gauerdia', 'goizaldea', 'goiza', 'eguerdia', 'arratsaldea', 'iluntzea', 'gaua']
      ],
      [
        '00:00', ['00:00', '06:00'], ['06:00', '12:00'], ['12:00', '14:00'], ['14:00', '19:00'],
        ['19:00', '21:00'], ['21:00', '24:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
