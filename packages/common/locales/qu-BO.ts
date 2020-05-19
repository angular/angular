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
  return 5;
}

export default [
  'qu-BO',
  [['a.m.', 'p.m.'], u, u],
  u,
  [
    ['D', 'L', 'M', 'X', 'J', 'V', 'S'], ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
    ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
  ],
  u,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
    [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre',
      'Octubre', 'Noviembre', 'Diciembre'
    ]
  ],
  u,
  [['BCE', 'dC'], ['BCE', 'd.C.'], u],
  1,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM, y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, '{0} {1}', '{1} {0}'],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '¤ #,##0.00', '#E0'],
  'BOB',
  'Bs',
  'Boliviano',
  {
    'BBD': ['BBG', '$'],
    'BMD': ['DBM', '$'],
    'BOB': ['Bs'],
    'BZD': ['DBZ', '$'],
    'CAD': ['$CA', '$'],
    'JPY': ['JP¥', '¥'],
    'USD': ['$US', '$']
  },
  'ltr',
  plural
];
