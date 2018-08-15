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
  'fo',
  [['AM', 'PM'], u, u],
  u,
  [
    ['S', 'M', 'T', 'M', 'H', 'F', 'L'], ['sun.', 'mán.', 'týs.', 'mik.', 'hós.', 'frí.', 'ley.'],
    ['sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur', 'leygardagur'],
    ['su.', 'má.', 'tý.', 'mi.', 'hó.', 'fr.', 'le.']
  ],
  [
    ['S', 'M', 'T', 'M', 'H', 'F', 'L'], ['sun', 'mán', 'týs', 'mik', 'hós', 'frí', 'ley'],
    ['sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur', 'leygardagur'],
    ['su', 'má', 'tý', 'mi', 'hó', 'fr', 'le']
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
    [
      'januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
    [
      'januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'desember'
    ]
  ],
  [['fKr', 'eKr'], ['f.Kr.', 'e.Kr.'], ['fyri Krist', 'eftir Krist']],
  1,
  [6, 0],
  ['dd.MM.yy', 'dd.MM.y', 'd. MMMM y', 'EEEE, d. MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} \'kl\'. {0}', u],
  [',', '.', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'DKK',
  'kr',
  'donsk króna',
  {'DKK': ['kr'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
