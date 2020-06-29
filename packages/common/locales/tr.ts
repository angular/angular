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
  'tr',
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
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim',
      'Kasım', 'Aralık'
    ]
  ],
  u,
  [['MÖ', 'MS'], u, ['Milattan Önce', 'Milattan Sonra']],
  1,
  [6, 0],
  ['d.MM.y', 'd MMM y', 'd MMMM y', 'd MMMM y EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '%#,##0', '¤#,##0.00', '#E0'],
  'TRY',
  '₺',
  'Türk Lirası',
  {'AUD': ['AU$', '$'], 'RON': [u, 'L'], 'THB': ['฿'], 'TRY': ['₺'], 'TWD': ['NT$']},
  'ltr',
  plural
];
