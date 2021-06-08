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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || n === 1) return 1;
  return 5;
}
global.ng.common.locales['mr'] = [
  'mr',
  [['स', 'सं'], ['म.पू.', 'म.उ.'], u],
  [['म.पू.', 'म.उ.'], u, u],
  [
    ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'], ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
  ],
  u,
  [
    ['जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'],
    ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
    [
      'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर',
      'डिसेंबर'
    ]
  ],
  u,
  [['इ. स. पू.', 'इ. स.'], u, ['ईसवीसनपूर्व', 'ईसवीसन']],
  0,
  [0, 0],
  ['d/M/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, d MMMM, y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1}, {0}', u, '{1} रोजी {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##0%', '¤#,##0.00', '[#E0]'],
  'INR',
  '₹',
  'भारतीय रुपया',
  {'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$']},
  'ltr',
  plural,
  [
    [
      ['म.रा.', 'दु', 'प', 'स', 'दु', 'सं', 'सा', 'रा'],
      ['मध्यरात्र', 'मध्यान्ह', 'पहाट', 'सकाळ', 'दुपार', 'संध्याकाळ', 'सायंकाळ', 'रात्र'], u
    ],
    [
      ['म.रा.', 'म', 'प', 'स', 'दु', 'सं', 'सा', 'रात्र'],
      ['मध्यरात्र', 'मध्यान्ह', 'पहाट', 'सकाळ', 'दुपार', 'संध्याकाळ', 'सायंकाळ', 'रात्र'], u
    ],
    [
      '00:00', '12:00', ['04:00', '06:00'], ['06:00', '12:00'], ['12:00', '16:00'],
      ['16:00', '18:00'], ['18:00', '21:00'], ['21:00', '04:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
