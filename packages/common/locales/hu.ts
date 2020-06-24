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
  if (n === 1) return 1;
  return 5;
}

export default [
  'hu',
  [['de.', 'du.'], u, u],
  u,
  [
    ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'], ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
    ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'],
    ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo']
  ],
  u,
  [
    ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'A', 'Sz', 'O', 'N', 'D'],
    [
      'jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.',
      'dec.'
    ],
    [
      'január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus',
      'szeptember', 'október', 'november', 'december'
    ]
  ],
  u,
  [['ie.', 'isz.'], ['i. e.', 'i. sz.'], ['Krisztus előtt', 'időszámításunk szerint']],
  1,
  [6, 0],
  ['y. MM. dd.', 'y. MMM d.', 'y. MMMM d.', 'y. MMMM d., EEEE'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'HUF',
  'Ft',
  'magyar forint',
  {
    'AUD': [u, '$'],
    'BRL': [u, 'R$'],
    'CAD': [u, '$'],
    'CNY': [u, '¥'],
    'EUR': [u, '€'],
    'GBP': [u, '£'],
    'HKD': [u, '$'],
    'HUF': ['Ft'],
    'ILS': [u, '₪'],
    'INR': [u, '₹'],
    'KRW': [u, '₩'],
    'MXN': [u, '$'],
    'NZD': [u, '$'],
    'TWD': [u, 'NT$'],
    'USD': [u, '$'],
    'VND': [u, '₫'],
    'XCD': [u, '$']
  },
  'ltr',
  plural
];
