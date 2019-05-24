/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  if (n === 1) return 1;
  return 5;
}

export default [
  'sd',
  [
    ['صبح، منجهند', 'منجهند، شام'],
    ['صبح، منجهند', 'شام، منجهند'],
    ['صبح، منجهند', 'منجهند، شام']
  ],
  [['صبح، منجهند', 'منجهند، شام'], u, u],
  [
    ['آچر', 'سو', 'اڱارو', 'اربع', 'خم', 'جمعو', 'ڇنڇر'],
    ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'], u, u
  ],
  [
    ['آچ', 'سو', 'اڱ', 'ار', 'خم', 'جم', 'ڇن'],
    ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'], u, u
  ],
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ',
      'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'
    ],
    u
  ],
  u, [['BCE', 'CE'], u, ['مسيح کان اڳ', 'عيسوي کان پهرين']], 0, [6, 0],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'Rs', 'پاڪستاني رپي',
  {'JPY': ['JP¥', '¥'], 'PKR': ['Rs'], 'USD': ['US$', '$']}, plural
];
