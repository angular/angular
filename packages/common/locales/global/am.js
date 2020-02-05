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
    let i = Math.floor(Math.abs(n));
    if (i === 0 || n === 1) return 1;
    return 5;
  }
  global.ng.common.locales['am'] = [
    'am',
    [['ጠ', 'ከ'], ['ጥዋት', 'ከሰዓት'], u],
    u,
    [
      ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
      ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
      ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
      ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ']
    ],
    u,
    [
      ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ', 'ኦ', 'ሴ', 'ኦ', 'ኖ', 'ዲ'],
      [
        'ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ',
        'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም'
      ],
      [
        'ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
        'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር',
        'ዲሴምበር'
      ]
    ],
    u,
    [['ዓ/ዓ', 'ዓ/ም'], u, ['ዓመተ ዓለም', 'ዓመተ ምሕረት']],
    0,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'y MMMM d, EEEE'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
    'ETB',
    'ብር',
    'የኢትዮጵያ ብር',
    {
      'AUD': ['AU$', '$'],
      'CNH': ['የቻይና ዩዋን'],
      'ETB': ['ብር'],
      'JPY': ['JP¥', '¥'],
      'THB': ['฿'],
      'TWD': ['NT$'],
      'USD': ['US$', '$']
    },
    'ltr',
    plural,
    [
      [
        ['እኩለ ሌሊት', 'ቀ', 'ጥዋት1', 'ከሰዓት1', 'ማታ1', 'ሌሊት1'],
        [
          'እኩለ ሌሊት', 'ቀትር', 'ጥዋት1', 'ከሰዓት 7', 'ማታ1',
          'ሌሊት1'
        ],
        [
          'እኩለ ሌሊት', 'ቀትር', 'ጥዋት1', 'ከሰዓት 7 ሰዓት', 'ማታ1',
          'ሌሊት1'
        ]
      ],
      [
        [
          'እኩለ ሌሊት', 'ቀትር', 'ጥዋት', 'ከሰዓት በኋላ', 'ማታ',
          'ሌሊት'
        ],
        [
          'እኩለ ሌሊት', 'ቀትር', 'ጥዋት1', 'ከሰዓት በኋላ', 'ማታ',
          'ሌሊት'
        ],
        u
      ],
      [
        '00:00', '12:00', ['06:00', '12:00'], ['12:00', '18:00'], ['18:00', '24:00'],
        ['00:00', '06:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
