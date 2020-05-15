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
  if (n === 2) return 2;
  return 5;
}

export default [
  'se-SE',
  [['i.b.', 'e.b.'], u, ['iđitbeaivet', 'eahketbeaivet']],
  [['i.b.', 'e.b.'], u, ['iđitbeaivi', 'eahketbeaivi']],
  [
    ['S', 'V', 'M', 'G', 'D', 'B', 'L'], ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
    [
      'sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat', 'lávvardat'
    ],
    ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv']
  ],
  u,
  [
    ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
    ['ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
    [
      'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu',
      'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'
    ]
  ],
  u,
  [['o.Kr.', 'm.Kr.'], u, ['ovdal Kristtusa', 'maŋŋel Kristtusa']],
  1,
  [6, 0],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '−', '·10^', '·', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'SEK',
  'kr',
  'ruoŧŧa kruvdno',
  {
    'DKK': ['Dkr', 'kr'],
    'JPY': ['JP¥', '¥'],
    'NOK': ['Nkr', 'kr'],
    'SEK': ['kr'],
    'THB': ['฿'],
    'USD': ['US$', '$']
  },
  'ltr',
  plural
];
