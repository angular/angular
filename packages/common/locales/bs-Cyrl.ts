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
  'bs-Cyrl',
  [['пре подне', 'поподне'], u, ['прије подне', 'послије подне']],
  u,
  [
    ['н', 'п', 'у', 'с', 'ч', 'п', 'с'], ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
    ['недјеља', 'понедјељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
    ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб']
  ],
  u,
  [
    ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
    ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'ауг', 'сеп', 'окт', 'нов', 'дец'],
    [
      'јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'аугуст', 'септембар', 'октобар',
      'новембар', 'децембар'
    ]
  ],
  u,
  [['п.н.е.', 'н.е.'], ['п. н. е.', 'н. е.'], ['прије нове ере', 'нове ере']],
  1,
  [6, 0],
  ['d.M.yy.', 'dd.MM.y.', 'dd. MMMM y.', 'EEEE, dd. MMMM y.'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'BAM',
  'КМ',
  'Конвертибилна марка',
  {
    'BAM': ['КМ', 'KM'],
    'CZK': ['Кч', 'Kč'],
    'PLN': ['зл', 'zł'],
    'RSD': ['дин.'],
    'TRY': ['Тл', '₺'],
    'USD': ['US$', '$']
  },
  'ltr',
  plural
];
