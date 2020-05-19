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
  'bez',
  [['pamilau', 'pamunyi'], u, u],
  u,
  [
    ['M', 'J', 'H', 'H', 'H', 'W', 'J'], ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
    [
      'pa mulungu', 'pa shahuviluha', 'pa hivili', 'pa hidatu', 'pa hitayi', 'pa hihanu',
      'pa shahulembela'
    ],
    ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem']
  ],
  u,
  [
    ['H', 'V', 'D', 'T', 'H', 'S', 'S', 'N', 'T', 'K', 'K', 'K'],
    ['Hut', 'Vil', 'Dat', 'Tai', 'Han', 'Sit', 'Sab', 'Nan', 'Tis', 'Kum', 'Kmj', 'Kmb'],
    [
      'pa mwedzi gwa hutala', 'pa mwedzi gwa wuvili', 'pa mwedzi gwa wudatu', 'pa mwedzi gwa wutai',
      'pa mwedzi gwa wuhanu', 'pa mwedzi gwa sita', 'pa mwedzi gwa saba', 'pa mwedzi gwa nane',
      'pa mwedzi gwa tisa', 'pa mwedzi gwa kumi', 'pa mwedzi gwa kumi na moja',
      'pa mwedzi gwa kumi na mbili'
    ]
  ],
  u,
  [['KM', 'BM'], u, ['Kabla ya Mtwaa', 'Baada ya Mtwaa']],
  1,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'],
  'TZS',
  'TSh',
  'Shilingi ya Hutanzania',
  {'JPY': ['JP¥', '¥'], 'TZS': ['TSh'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
