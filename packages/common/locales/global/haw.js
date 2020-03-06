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
  global.ng.common.locales['haw'] = [
    'haw',
    [['AM', 'PM'], u, u],
    u,
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['LP', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      ['Lāpule', 'Poʻakahi', 'Poʻalua', 'Poʻakolu', 'Poʻahā', 'Poʻalima', 'Poʻaono'],
      ['LP', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6']
    ],
    u,
    [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      [
        'Ian.', 'Pep.', 'Mal.', 'ʻAp.', 'Mei', 'Iun.', 'Iul.', 'ʻAu.', 'Kep.', 'ʻOk.', 'Now.',
        'Kek.'
      ],
      [
        'Ianuali', 'Pepeluali', 'Malaki', 'ʻApelila', 'Mei', 'Iune', 'Iulai', 'ʻAukake',
        'Kepakemapa', 'ʻOkakopa', 'Nowemapa', 'Kekemapa'
      ]
    ],
    u,
    [['BCE', 'CE'], u, u],
    0,
    [6, 0],
    ['d/M/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
    'USD',
    '$',
    'USD',
    {'JPY': ['JP¥', '¥']},
    'ltr',
    plural,
    []
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
