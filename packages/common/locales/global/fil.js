/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (v === 0 && (i === 1 || i === 2 || i === 3) ||
      v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) ||
      !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
    return 1;
  return 5;
}
global.ng.common.locales['fil'] = [
  'fil',
  [['am', 'pm'], ['AM', 'PM'], u],
  [['AM', 'PM'], u, u],
  [
    ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'], u,
    ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
    ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa']
  ],
  u,
  [
    ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'], u,
    [
      'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre',
      'Oktubre', 'Nobyembre', 'Disyembre'
    ]
  ],
  [
    ['E', 'P', 'M', 'A', 'M', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
    ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
    [
      'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre',
      'Oktubre', 'Nobyembre', 'Disyembre'
    ]
  ],
  [['BC', 'AD'], u, ['Before Christ', 'Anno Domini']],
  0,
  [6, 0],
  ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1}, {0}', u, '{1} \'nang\' {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'PHP',
  '₱',
  'Piso ng Pilipinas',
  {'PHP': ['₱'], 'THB': ['฿'], 'TWD': ['NT$']},
  'ltr',
  plural,
  [
    [
      ['hatinggabi', 'tanghaling-tapat', 'umaga', 'madaling-araw', 'sa hapon', 'sa gabi', 'gabi'],
      [
        'hatinggabi', 'tanghaling-tapat', 'nang umaga', 'madaling-araw', 'tanghali', 'ng hapon',
        'gabi'
      ],
      [
        'hatinggabi', 'tanghaling-tapat', 'nang umaga', 'madaling-araw', 'tanghali', 'ng hapon',
        'ng gabi'
      ]
    ],
    [
      ['hatinggabi', 'tanghaling-tapat', 'umaga', 'madaling-araw', 'tanghali', 'gabi', 'gabi'],
      ['hatinggabi', 'tanghaling-tapat', 'umaga', 'madaling-araw', 'tanghali', 'hapon', 'gabi'], u
    ],
    [
      '00:00', '12:00', ['00:00', '06:00'], ['06:00', '12:00'], ['12:00', '16:00'],
      ['16:00', '18:00'], ['18:00', '24:00']
    ]
  ]
];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
