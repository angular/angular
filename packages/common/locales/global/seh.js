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
  global.ng.common.locales['seh'] = [
    'seh',
    [['AM', 'PM'], u, u],
    u,
    [
      ['D', 'P', 'C', 'T', 'N', 'S', 'S'], ['Dim', 'Pos', 'Pir', 'Tat', 'Nai', 'Sha', 'Sab'],
      ['Dimingu', 'Chiposi', 'Chipiri', 'Chitatu', 'Chinai', 'Chishanu', 'Sabudu'],
      ['Dim', 'Pos', 'Pir', 'Tat', 'Nai', 'Sha', 'Sab']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Otu', 'Nov', 'Dec'],
      [
        'Janeiro', 'Fevreiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Augusto', 'Setembro',
        'Otubro', 'Novembro', 'Decembro'
      ]
    ],
    u,
    [['AC', 'AD'], u, ['Antes de Cristo', 'Anno Domini']],
    0,
    [6, 0],
    ['d/M/y', 'd \'de\' MMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'],
    'MZN',
    'MTn',
    'Metical de Moçambique',
    {'JPY': ['JP¥', '¥'], 'MZN': ['MTn'], 'USD': ['US$', '$']},
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
