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
  'se-FI',
  [['i', 'e'], ['ib', 'eb'], u],
  [['ib', 'eb'], u, u],
  [
    ['S', 'M', 'D', 'G', 'D', 'B', 'L'], ['so', 'má', 'di', 'ga', 'du', 'be', 'lá'],
    ['sotnabeaivi', 'mánnodat', 'disdat', 'gaskavahkku', 'duorastat', 'bearjadat', 'lávvordat'],
    ['so', 'má', 'di', 'ga', 'du', 'be', 'lá']
  ],
  u,
  [
    ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
    [
      'ođđj', 'guov', 'njuk', 'cuoŋ', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'
    ],
    [
      'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu',
      'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'
    ]
  ],
  u,
  [['oKr.', 'mKr.'], u, ['ovdal Kristusa', 'maŋŋel Kristusa']],
  1,
  [6, 0],
  ['dd.MM.y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '−', '·10^', '·', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'euro',
  {
    'DKK': ['Dkr', 'kr'],
    'JPY': ['JP¥', '¥'],
    'NOK': ['kr'],
    'SEK': ['Skr', 'kr'],
    'THB': ['฿'],
    'USD': ['US$', '$']
  },
  'ltr',
  plural
];
