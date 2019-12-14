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
  global.ng.common.locales['ksb'] = [
    'ksb',
    [['makeo', 'nyiaghuo'], u, u],
    u,
    [
      ['2', '3', '4', '5', 'A', 'I', '1'], ['Jpi', 'Jtt', 'Jmn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
      ['Jumaapii', 'Jumaatatu', 'Jumaane', 'Jumaatano', 'Alhamisi', 'Ijumaa', 'Jumaamosi'],
      ['Jpi', 'Jtt', 'Jmn', 'Jtn', 'Alh', 'Iju', 'Jmo']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
      [
        'Januali', 'Febluali', 'Machi', 'Aplili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
        'Oktoba', 'Novemba', 'Desemba'
      ]
    ],
    u,
    [['KK', 'BK'], u, ['Kabla ya Klisto', 'Baada ya Klisto']],
    1,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'],
    'TZS',
    'TSh',
    'shilingi ya Tanzania',
    {'JPY': ['JP¥', '¥'], 'TZS': ['TSh'], 'USD': ['US$', '$']},
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
