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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || n === 1) return 1;
  return 5;
}

export default [
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
  plural
];
