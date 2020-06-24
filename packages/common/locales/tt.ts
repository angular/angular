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
  'tt',
  [['AM', 'PM'], u, u],
  u,
  [
    ['Я', 'Д', 'С', 'Ч', 'П', 'Җ', 'Ш'], ['якш.', 'дүш.', 'сиш.', 'чәр.', 'пәнҗ.', 'җом.', 'шим.'],
    ['якшәмбе', 'дүшәмбе', 'сишәмбе', 'чәршәмбе', 'пәнҗешәмбе', 'җомга', 'шимбә'],
    ['якш.', 'дүш.', 'сиш.', 'чәр.', 'пәнҗ.', 'җом.', 'шим.']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'гыйн.', 'фев.', 'мар.', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.',
      'дек.'
    ],
    [
      'гыйнвар', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь',
      'октябрь', 'ноябрь', 'декабрь'
    ]
  ],
  u,
  [['б.э.к.', 'милади'], u, ['безнең эрага кадәр', 'безнең эра']],
  1,
  [6, 0],
  ['dd.MM.y', 'd MMM, y \'ел\'', 'd MMMM, y \'ел\'', 'd MMMM, y \'ел\', EEEE'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  ['{1}, {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'RUB',
  '₽',
  'Россия сумы',
  {'JPY': ['JP¥', '¥'], 'RUB': ['₽']},
  'ltr',
  plural
];
