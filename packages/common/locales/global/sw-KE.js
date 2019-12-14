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
    let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
    if (i === 1 && v === 0) return 1;
    return 5;
  }
  global.ng.common.locales['sw-ke'] = [
    'sw-KE',
    [['am', 'pm'], ['AM', 'PM'], u],
    [['AM', 'PM'], u, u],
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'], u, u
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
      [
        'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
        'Oktoba', 'Novemba', 'Desemba'
      ]
    ],
    u,
    [['KK', 'BK'], u, ['Kabla ya Kristo', 'Baada ya Kristo']],
    0,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    'KES',
    'Ksh',
    'Shilingi ya Kenya',
    {'JPY': ['JP¥', '¥'], 'KES': ['Ksh'], 'THB': ['฿'], 'TWD': ['NT$'], 'TZS': ['TSh']},
    'ltr',
    plural,
    [
      [
        ['usiku', 'mchana', 'alfajiri', 'asubuhi', 'mchana', 'jioni', 'usiku'],
        ['saa sita za usiku', 'adhuhuri', 'alfajiri', 'asubuhi', 'mchana', 'jioni', 'usiku'],
        [
          'saa sita za usiku', 'saa sita za mchana', 'alfajiri', 'asubuhi', 'mchana', 'jioni',
          'usiku'
        ]
      ],
      [
        [
          'saa sita za usiku', 'saa sita za mchana', 'alfajiri', 'asubuhi', 'mchana', 'jioni',
          'usiku'
        ],
        ['saa sita za usiku', 'adhuhuri', 'alfajiri', 'asubuhi', 'alasiri', 'jioni', 'usiku'],
        [
          'saa sita za usiku', 'saa sita za mchana', 'alfajiri', 'asubuhi', 'mchana', 'jioni',
          'usiku'
        ]
      ],
      [
        '00:00', '12:00', ['04:00', '07:00'], ['07:00', '12:00'], ['12:00', '16:00'],
        ['16:00', '19:00'], ['19:00', '04:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
