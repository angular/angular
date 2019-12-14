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
    if (n === 1) return 1;
    return 5;
  }
  global.ng.common.locales['bg'] = [
    'bg',
    [['am', 'pm'], u, ['пр.об.', 'сл.об.']],
    [['am', 'pm'], u, u],
    [
      ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
      ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
      [
        'неделя', 'понеделник', 'вторник', 'сряда',
        'четвъртък', 'петък', 'събота'
      ],
      ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
    ],
    u,
    [
      ['я', 'ф', 'м', 'а', 'м', 'ю', 'ю', 'а', 'с', 'о', 'н', 'д'],
      [
        'яну', 'фев', 'март', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп',
        'окт', 'ное', 'дек'
      ],
      [
        'януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли',
        'август', 'септември', 'октомври', 'ноември',
        'декември'
      ]
    ],
    u,
    [['пр.Хр.', 'сл.Хр.'], u, ['преди Христа', 'след Христа']],
    1,
    [6, 0],
    ['d.MM.yy \'г\'.', 'd.MM.y \'г\'.', 'd MMMM y \'г\'.', 'EEEE, d MMMM y \'г\'.'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
    ['{1}, {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '0.00 ¤', '#E0'],
    'BGN',
    'лв.',
    'Български лев',
    {
      'ARS': [],
      'AUD': [],
      'BBD': [],
      'BDT': [],
      'BGN': ['лв.'],
      'BMD': [],
      'BND': [],
      'BRL': [],
      'BSD': [],
      'BYN': [],
      'BZD': [],
      'CAD': [],
      'CLP': [],
      'CNY': [],
      'COP': [],
      'CRC': [],
      'CUP': [],
      'DOP': [],
      'FJD': [],
      'FKP': [],
      'GBP': [u, '£'],
      'GIP': [],
      'GYD': [],
      'HKD': [],
      'ILS': [],
      'INR': [],
      'JMD': [],
      'JPY': [u, '¥'],
      'KHR': [],
      'KRW': [],
      'KYD': [],
      'KZT': [],
      'LAK': [],
      'LRD': [],
      'MNT': [],
      'MXN': [],
      'NAD': [],
      'NGN': [],
      'NZD': [],
      'PHP': [],
      'PYG': [],
      'RON': [],
      'SBD': [],
      'SGD': [],
      'SRD': [],
      'SSP': [],
      'TRY': [],
      'TTD': [],
      'TWD': [],
      'UAH': [],
      'USD': ['щ.д.', '$'],
      'UYU': [],
      'VND': [],
      'XCD': [u, '$']
    },
    plural,
    [
      [
        [
          'полунощ', 'сутринта', 'на обяд', 'следобед',
          'вечерта', 'през нощта'
        ],
        u, u
      ],
      u,
      [
        '00:00', ['04:00', '11:00'], ['11:00', '14:00'], ['14:00', '18:00'], ['18:00', '22:00'],
        ['22:00', '04:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
