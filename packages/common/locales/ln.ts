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
  if (n === Math.floor(n) && n >= 0 && n <= 1) return 1;
  return 5;
}

export default [
  'ln',
  [['ntɔ́ngɔ́', 'mpókwa'], u, u],
  u,
  [
    ['e', 'y', 'm', 'm', 'm', 'm', 'p'], ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
    [
      'eyenga', 'mokɔlɔ mwa yambo', 'mokɔlɔ mwa míbalé', 'mokɔlɔ mwa mísáto', 'mokɔlɔ ya mínéi',
      'mokɔlɔ ya mítáno', 'mpɔ́sɔ'
    ],
    ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps']
  ],
  u,
  [
    ['y', 'f', 'm', 'a', 'm', 'y', 'y', 'a', 's', 'ɔ', 'n', 'd'],
    ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul', 'agt', 'stb', 'ɔtb', 'nvb', 'dsb'],
    [
      'sánzá ya yambo', 'sánzá ya míbalé', 'sánzá ya mísáto', 'sánzá ya mínei', 'sánzá ya mítáno',
      'sánzá ya motóbá', 'sánzá ya nsambo', 'sánzá ya mwambe', 'sánzá ya libwa', 'sánzá ya zómi',
      'sánzá ya zómi na mɔ̌kɔ́', 'sánzá ya zómi na míbalé'
    ]
  ],
  u,
  [['libóso ya', 'nsima ya Y'], u, ['Yambo ya Yézu Krís', 'Nsima ya Yézu Krís']],
  1,
  [6, 0],
  ['d/M/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'CDF',
  'FC',
  'Falánga ya Kongó',
  {'CDF': ['FC'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
