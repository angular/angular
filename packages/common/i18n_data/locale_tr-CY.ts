/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

export default [
  'tr-CY',
  [
    ['öö', 'ös'],
    ['ÖÖ', 'ÖS'],
  ],
  [
    ['ÖÖ', 'ÖS'],
    ,
  ],
  [
    ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'], ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']
  ],
  ,
  [
    ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
    ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim',
      'Kasım', 'Aralık'
    ]
  ],
  , [['MÖ', 'MS'], , ['Milattan Önce', 'Milattan Sonra']], 1, [6, 0],
  ['d.MM.y', 'd MMM y', 'd MMMM y', 'd MMMM y EEEE'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '%#,##0', '¤#,##0.00', '#E0'], '€', 'Euro', function(n: number):
                                                                number {
                                                                  if (n === 1) return 1;
                                                                  return 5;
                                                                }
];
