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
  global.ng.common.locales['as'] = [
    'as',
    [['পূৰ্বাহ্ন', 'অপৰাহ্ন'], u, u],
    u,
    [
      ['দ', 'স', 'ম', 'ব', 'ব', 'শ', 'শ'],
      [
        'দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ',
        'শনি'
      ],
      [
        'দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ',
        'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুক্ৰবাৰ',
        'শনিবাৰ'
      ],
      [
        'দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ',
        'শনি'
      ]
    ],
    u,
    [
      ['জ', 'ফ', 'ম', 'এ', 'ম', 'জ', 'জ', 'আ', 'ছ', 'অ', 'ন', 'ড'],
      [
        'জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে’',
        'জুন', 'জুলাই', 'আগ', 'ছেপ্তে', 'অক্টো',
        'নৱে', 'ডিচে'
      ],
      [
        'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ',
        'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগষ্ট',
        'ছেপ্তেম্বৰ', 'অক্টোবৰ', 'নৱেম্বৰ',
        'ডিচেম্বৰ'
      ]
    ],
    u,
    [
      ['খ্ৰীঃ পূঃ', 'খ্ৰীঃ'], u,
      ['খ্ৰীষ্টপূৰ্ব', 'খ্ৰীষ্টাব্দ']
    ],
    0,
    [0, 0],
    ['d-M-y', 'dd-MM-y', 'd MMMM, y', 'EEEE, d MMMM, y'],
    ['a h.mm', 'a h.mm.ss', 'a h.mm.ss z', 'a h.mm.ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'],
    'INR',
    '₹',
    'ভাৰতীয় ৰুপী',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
