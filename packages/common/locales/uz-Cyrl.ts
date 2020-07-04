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
  return 5;
}

export default [
  'uz-Cyrl',
  [['ТО', 'ТК'], u, u],
  u,
  [
    ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'], ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
    ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба'],
    ['як', 'ду', 'се', 'чо', 'па', 'жу', 'ша']
  ],
  u,
  [
    ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
    ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    [
      'январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр',
      'ноябр', 'декабр'
    ]
  ],
  u,
  [['м.а.', 'милодий'], u, ['милоддан аввалги', 'милодий']],
  1,
  [6, 0],
  ['dd/MM/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, dd MMMM, y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss (z)', 'HH:mm:ss (zzzz)'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'ҳақиқий сон эмас', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'UZS',
  'сўм',
  'Ўзбекистон сўм',
  {'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'USD': ['US$', '$'], 'UZS': ['сўм']},
  'ltr',
  plural
];
