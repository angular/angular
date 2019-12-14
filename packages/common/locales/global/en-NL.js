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
  global.ng.common.locales['en-nl'] = [
    'en-NL',
    [['a', 'p'], ['am', 'pm'], u],
    [['am', 'pm'], u, u],
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    ],
    u,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
      ]
    ],
    u,
    [['B', 'A'], ['BC', 'AD'], ['Before Christ', 'Anno Domini']],
    1,
    [6, 0],
    ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1}, {0}', u, '{1} \'at\' {0}', u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00;¤ -#,##0.00', '#E0'],
    'EUR',
    '€',
    'Euro',
    {'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
    'ltr',
    plural,
    [
      [
        ['mi', 'n', 'in the morning', 'in the afternoon', 'in the evening', 'at night'],
        ['midnight', 'noon', 'in the morning', 'in the afternoon', 'in the evening', 'at night'], u
      ],
      [['midnight', 'noon', 'morning', 'afternoon', 'evening', 'night'], u, u],
      [
        '00:00', '12:00', ['06:00', '12:00'], ['12:00', '18:00'], ['18:00', '21:00'],
        ['21:00', '06:00']
      ]
    ]
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
   typeof window !== 'undefined' && window);
