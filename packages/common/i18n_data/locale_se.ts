/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

import {Plural} from '@angular/common';

export default [
  'se', [['i.b.', 'e.b.'], , ['iđitbeaivet', 'eahketbeaivet']],
  [['i.b.', 'e.b.'], , ['iđitbeaivi', 'eahketbeaivi']],
  [
    ['S', 'V', 'M', 'G', 'D', 'B', 'L'], ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
    [
      'sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat', 'lávvardat'
    ],
    ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv']
  ],
  ,
  [
    ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
    ['ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
    [
      'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu',
      'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'
    ]
  ],
  , [['o.Kr.', 'm.Kr.'], , ['ovdal Kristtusa', 'maŋŋel Kristtusa']], 1, [6, 0],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', ' ', ';', '%', '+', '−', '·10^', '·', '‰', '∞', '¤¤¤', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'kr', 'norgga kruvdno', function(n: number):
                                                                             Plural {
                                                                               if (n === 1)
                                                                                 return Plural.One;
                                                                               if (n === 2)
                                                                                 return Plural.Two;
                                                                               return Plural.Other;
                                                                             }
];
