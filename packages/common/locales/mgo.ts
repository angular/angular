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
  'mgo',
  [['AM', 'PM'], u, u],
  u,
  [
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
    ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'], u,
    ['1', '2', '3', '4', '5', '6', '7']
  ],
  u,
  [
    ['M1', 'A2', 'M3', 'N4', 'F5', 'I6', 'A7', 'I8', 'K9', '10', '11', '12'],
    [
      'mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
      'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
    ],
    [
      'iməg mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
      'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
    ]
  ],
  u,
  [['BCE', 'CE'], u, u],
  1,
  [6, 0],
  ['y-MM-dd', 'y MMM d', 'y MMMM d', 'EEEE, y MMMM dd'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'XAF',
  'FCFA',
  'shirè',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
