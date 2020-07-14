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
  if (n === Math.floor(n) && n >= 0 && n <= 1) return 1;
  return 5;
}

export default [
  'pa',
  [['ਸ.', 'ਸ਼.'], ['ਪੂ.ਦੁ.', 'ਬਾ.ਦੁ.'], u],
  [['ਪੂ.ਦੁ.', 'ਬਾ.ਦੁ.'], u, u],
  [
    ['ਐ', 'ਸੋ', 'ਮੰ', 'ਬੁੱ', 'ਵੀ', 'ਸ਼ੁੱ', 'ਸ਼'], ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨਿੱਚਰ'],
    ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨਿੱਚਰਵਾਰ'],
    ['ਐਤ', 'ਸੋਮ', 'ਮੰਗ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕ', 'ਸ਼ਨਿੱ']
  ],
  u,
  [
    ['ਜ', 'ਫ਼', 'ਮਾ', 'ਅ', 'ਮ', 'ਜੂ', 'ਜੁ', 'ਅ', 'ਸ', 'ਅ', 'ਨ', 'ਦ'],
    ['ਜਨ', 'ਫ਼ਰ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾ', 'ਅਗ', 'ਸਤੰ', 'ਅਕਤੂ', 'ਨਵੰ', 'ਦਸੰ'],
    ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ']
  ],
  u,
  [['ਈ.ਪੂ.', 'ਸੰਨ'], ['ਈ. ਪੂ.', 'ਸੰਨ'], ['ਈਸਵੀ ਪੂਰਵ', 'ਈਸਵੀ ਸੰਨ']],
  0,
  [0, 0],
  ['d/M/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1}, {0}', u, '{1} {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '[#E0]'],
  'INR',
  '₹',
  'ਭਾਰਤੀ ਰੁਪਇਆ',
  {'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'], 'USD': ['US$', '$'], 'XXX': []},
  'ltr',
  plural
];
