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
  'so-ET', [['sn.', 'gn.'], u, u], u,
  [
    ['A', 'I', 'T', 'A', 'Kh', 'J', 'S'], ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'],
    ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti'],
    ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab']
  ],
  u,
  [
    ['K', 'L', 'S', 'A', 'S', 'L', 'T', 'S', 'S', 'T', 'K', 'L'],
    ['Kob', 'Lab', 'Sad', 'Afr', 'Sha', 'Lix', 'Tod', 'Sid', 'Sag', 'Tob', 'KIT', 'LIT'],
    [
      'Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad',
      'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad',
      'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'
    ]
  ],
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['Kob', 'Lab', 'Sad', 'Afr', 'Sha', 'Lix', 'Tod', 'Sid', 'Sag', 'Tob', 'KIT', 'LIT'],
    [
      'Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad',
      'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad',
      'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'
    ]
  ],
  [['CK', 'CD'], u, u], 0, [6, 0], ['dd/MM/yy', 'dd-MMM-y', 'dd MMMM y', 'EEEE, MMMM dd, y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], 'Br', 'Birta Itoobbiya',
  {'ETB': ['Br'], 'JPY': ['JP¥', '¥'], 'SOS': ['S'], 'USD': ['US$', '$']}, plural
];
