/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
    if (n % 10 === 1 && !(n % 100 === 11)) return 1;
    if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
        !(n % 100 >= 12 && n % 100 <= 14))
      return 3;
    if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
        n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
      return 4;
    return 5;
  }
  global.ng.common.locales['be'] = [
    'be',
    [['am', 'pm'], ['AM', 'PM'], u],
    [['AM', 'PM'], u, u],
    [
      ['н', 'п', 'а', 'с', 'ч', 'п', 'с'],
      ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
      [
        'нядзеля', 'панядзелак', 'аўторак', 'серада', 'чацвер',
        'пятніца', 'субота'
      ],
      ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб']
    ],
    u,
    [
      ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
      [
        'сту', 'лют', 'сак', 'кра', 'мая', 'чэр', 'ліп', 'жні', 'вер',
        'кас', 'ліс', 'сне'
      ],
      [
        'студзеня', 'лютага', 'сакавіка', 'красавіка', 'мая',
        'чэрвеня', 'ліпеня', 'жніўня', 'верасня',
        'кастрычніка', 'лістапада', 'снежня'
      ]
    ],
    [
      ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
      [
        'сту', 'лют', 'сак', 'кра', 'май', 'чэр', 'ліп', 'жні', 'вер',
        'кас', 'ліс', 'сне'
      ],
      [
        'студзень', 'люты', 'сакавік', 'красавік', 'май',
        'чэрвень', 'ліпень', 'жнівень', 'верасень',
        'кастрычнік', 'лістапад', 'снежань'
      ]
    ],
    [
      ['да н.э.', 'н.э.'], u,
      ['да нараджэння Хрыстова', 'ад нараджэння Хрыстова']
    ],
    1,
    [6, 0],
    ['d.MM.yy', 'd.MM.y', 'd MMMM y \'г\'.', 'EEEE, d MMMM y \'г\'.'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss, zzzz'],
    ['{1}, {0}', u, '{1} \'у\' {0}', u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'BYN',
    'Br',
    'беларускі рубель',
    {
      'AUD': ['A$'],
      'BBD': [u, 'Bds$'],
      'BMD': [u, 'BD$'],
      'BRL': [u, 'R$'],
      'BSD': [u, 'B$'],
      'BYN': ['Br'],
      'BZD': [u, 'BZ$'],
      'CAD': [u, 'CA$'],
      'CUC': [u, 'CUC$'],
      'CUP': [u, '$MN'],
      'DOP': [u, 'RD$'],
      'FJD': [u, 'FJ$'],
      'FKP': [u, 'FK£'],
      'GYD': [u, 'G$'],
      'ISK': [u, 'Íkr'],
      'JMD': [u, 'J$'],
      'KYD': [u, 'CI$'],
      'LRD': [u, 'L$'],
      'MXN': ['MX$'],
      'NAD': [u, 'N$'],
      'NZD': [u, 'NZ$'],
      'RUB': ['₽', 'руб.'],
      'SBD': [u, 'SI$'],
      'SGD': [u, 'S$'],
      'TTD': [u, 'TT$'],
      'UYU': [u, '$U'],
      'XCD': ['EC$']
    },
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
