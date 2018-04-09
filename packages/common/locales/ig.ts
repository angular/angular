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
  return 5;
}

export default [
  'ig', [['A.M.', 'P.M.'], u, u], u,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat'],
    ['Mbọsị Ụka', 'Mọnde', 'Tiuzdee', 'Wenezdee', 'Tọọzdee', 'Fraịdee', 'Satọdee'],
    ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['Jen', 'Feb', 'Maa', 'Epr', 'Mee', 'Juu', 'Jul', 'Ọgọ', 'Sep', 'Ọkt', 'Nov', 'Dis'],
    [
      'Jenụwarị', 'Febrụwarị', 'Maachị', 'Eprel', 'Mee', 'Juun', 'Julaị',
      'Ọgọọst', 'Septemba', 'Ọktoba', 'Novemba', 'Disemba'
    ]
  ],
  u, [['T.K.', 'A.K.'], u, ['Tupu Kristi', 'Afọ Kristi']], 1, [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '₦', 'Naịra',
  {'JPY': ['JP¥', '¥'], 'NGN': ['₦'], 'USD': ['US$', '$']}, plural
];
