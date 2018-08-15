/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(function(global) {
global.ng = global.ng || {};
global.ng.common = global.ng.common || {};
global.ng.common.locales = global.ng.common.locales || {};
const u = undefined;
function plural(n) {
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11)) return 1;
  if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14) ||
      f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
          !(f % 100 >= 12 && f % 100 <= 14))
    return 3;
  return 5;
}
global.ng.common.locales['sr-cyrl-me'] = [
  'sr-Cyrl-ME',
  [['a', 'p'], ['прије подне', 'по подне'], u],
  u,
  [
    ['н', 'п', 'у', 'с', 'ч', 'п', 'с'], ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
    ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
    ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су']
  ],
  u,
  [
    ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
    ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
    [
      'јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар',
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
  'EUR',
  '€',
  'Евро',
  {
    'AUD': [u, '$'],
    'BAM': ['КМ', 'KM'],
    'GEL': [u, 'ლ'],
    'KRW': [u, '₩'],
    'NZD': [u, '$'],
    'TWD': ['NT$'],
    'USD': ['US$', '$'],
    'VND': [u, '₫']
  },
  'ltr',
  plural,
  [
    [
      ['поноћ', 'подне', 'јутро', 'по под.', 'вече', 'ноћ'],
      ['поноћ', 'подне', 'јутро', 'по под.', 'вече', 'ноћу'],
      ['поноћ', 'подне', 'ујутро', 'по подне', 'увече', 'ноћу']
    ],
    [['поноћ', 'подне', 'јутро', 'поподне', 'вече', 'ноћ'], u, u],
    [
      '00:00', '12:00', ['06:00', '12:00'], ['12:00', '18:00'], ['18:00', '21:00'],
      ['21:00', '06:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
