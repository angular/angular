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
  global.ng.common.locales['brx'] = [
    'brx',
    [['फुं', 'बेलासे'], u, u],
    u,
    [
      ['र', 'स', 'मं', 'बु', 'बि', 'सु', 'सु'],
      [
        'रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर',
        'सुनि'
      ],
      [
        'रबिबार', 'समबार', 'मंगलबार', 'बुदबार',
        'बिसथिबार', 'सुखुरबार', 'सुनिबार'
      ],
      [
        'रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर',
        'सुनि'
      ]
    ],
    u,
    [
      [
        'ज', 'फे', 'मा', 'ए', 'मे', 'जु', 'जु', 'आ', 'से', 'अ',
        'न', 'दि'
      ],
      [
        'जानुवारी', 'फेब्रुवारी', 'मार्स',
        'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ',
        'सेबथेज्ब़र', 'अखथबर', 'नबेज्ब़र',
        'दिसेज्ब़र'
      ],
      u
    ],
    u,
    [['ईसा.पूर्व', 'सन'], u, u],
    0,
    [0, 0],
    ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'],
    'INR',
    '₹',
    'रां',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
