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
  'fur',
  [['a.', 'p.'], u, u],
  u,
  [
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
    ['domenie', 'lunis', 'martars', 'miercus', 'joibe', 'vinars', 'sabide'],
    ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab']
  ],
  u,
  [
    ['Z', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D'],
    ['Zen', 'Fev', 'Mar', 'Avr', 'Mai', 'Jug', 'Lui', 'Avo', 'Set', 'Otu', 'Nov', 'Dic'],
    [
      'Zenâr', 'Fevrâr', 'Març', 'Avrîl', 'Mai', 'Jugn', 'Lui', 'Avost', 'Setembar', 'Otubar',
      'Novembar', 'Dicembar'
    ]
  ],
  u,
  [['pdC', 'ddC'], u, u],
  1,
  [6, 0],
  ['dd/MM/yy', 'dd/MM/y', 'd \'di\' MMMM \'dal\' y', 'EEEE d \'di\' MMMM \'dal\' y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', u, u, u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
  'EUR',
  '€',
  'euro',
  {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
