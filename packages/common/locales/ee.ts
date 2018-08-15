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
  'ee',
  [['ŋ', 'ɣ'], ['ŋdi', 'ɣetrɔ'], u],
  u,
  [
    ['k', 'd', 'b', 'k', 'y', 'f', 'm'], ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
    ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa'],
    ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem']
  ],
  u,
  [
    ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
    ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
    [
      'dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ',
      'kele', 'adeɛmekpɔxe', 'dzome'
    ]
  ],
  u,
  [['HYV', 'Yŋ'], u, ['Hafi Yesu Va', 'Yesu ŋɔli']],
  1,
  [6, 0],
  ['M/d/yy', 'MMM d \'lia\', y', 'MMMM d \'lia\' y', 'EEEE, MMMM d \'lia\' y'],
  ['a \'ga\' h:mm', 'a \'ga\' h:mm:ss', 'a \'ga\' h:mm:ss z', 'a \'ga\' h:mm:ss zzzz'],
  ['{0} {1}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'mnn', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'GHS',
  'GH₵',
  'ghana siɖi',
  {'AUD': ['AU$', '$'], 'GHS': ['GH₵'], 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
