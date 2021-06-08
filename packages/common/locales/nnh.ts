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
  'nnh',
  [['mbaʼámbaʼ', 'ncwònzém'], u, u],
  u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    [
      'lyɛʼɛ́ sẅíŋtè', 'mvfò lyɛ̌ʼ', 'mbɔ́ɔntè mvfò lyɛ̌ʼ', 'tsètsɛ̀ɛ lyɛ̌ʼ', 'mbɔ́ɔntè tsetsɛ̀ɛ lyɛ̌ʼ',
      'mvfò màga lyɛ̌ʼ', 'màga lyɛ̌ʼ'
    ],
    u, u
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'saŋ tsetsɛ̀ɛ lùm', 'saŋ kàg ngwóŋ', 'saŋ lepyè shúm', 'saŋ cÿó', 'saŋ tsɛ̀ɛ cÿó',
      'saŋ njÿoláʼ', 'saŋ tyɛ̀b tyɛ̀b mbʉ̀ŋ', 'saŋ mbʉ̀ŋ', 'saŋ ngwɔ̀ʼ mbÿɛ', 'saŋ tàŋa tsetsáʼ',
      'saŋ mejwoŋó', 'saŋ lùm'
    ],
    u
  ],
  u,
  [['m.z.Y.', 'm.g.n.Y.'], u, ['mé zyé Yěsô', 'mé gÿo ńzyé Yěsô']],
  1,
  [6, 0],
  ['dd/MM/yy', 'd MMM, y', '\'lyɛ\'̌ʼ d \'na\' MMMM, y', 'EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, '{1}, {0}', '{1},{0}'],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'XAF',
  'FCFA',
  'feláŋ CFA',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
