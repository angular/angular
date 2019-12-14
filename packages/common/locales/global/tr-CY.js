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
  global.ng.common.locales['tr-cy'] = [
    'tr-CY',
    [['öö', 'ös'], ['ÖÖ', 'ÖS'], u],
    [['ÖÖ', 'ÖS'], u, u],
    [
      ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'], ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
      ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
      ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']
    ],
    u,
    [
      ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
      ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
      [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül',
        'Ekim', 'Kasım', 'Aralık'
      ]
    ],
    u,
    [['MÖ', 'MS'], u, ['Milattan Önce', 'Milattan Sonra']],
    1,
    [6, 0],
    ['d.MM.y', 'd MMM y', 'd MMMM y', 'd MMMM y EEEE'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '%#,##0', '¤#,##0.00', '#E0'],
    'EUR',
    '€',
    'Euro',
    {'AUD': ['AU$', '$'], 'RON': [u, 'L'], 'THB': ['฿'], 'TRY': ['₺'], 'TWD': ['NT$']},
    plural,
    [
      [
        [
          'gece', 'ö', 'sabah', 'öğleden önce', 'öğleden sonra', 'akşamüstü', 'akşam',
          'gece'
        ],
        [
          'gece yarısı', 'öğle', 'sabah', 'öğleden önce', 'öğleden sonra', 'akşamüstü',
          'akşam', 'gece'
        ],
        u
      ],
      [
        [
          'gece yarısı', 'öğle', 'sabah', 'öğleden önce', 'öğleden sonra', 'akşamüstü',
          'akşam', 'gece'
        ],
        u, u
      ],
      [
        '00:00', '12:00', ['06:00', '11:00'], ['11:00', '12:00'], ['12:00', '18:00'],
        ['18:00', '19:00'], ['19:00', '21:00'], ['21:00', '06:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
