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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return 1;
  return 5;
}

export default [
  'en-CA',
  [['am', 'pm'], ['a.m.', 'p.m.'], u],
  [['a.m.', 'pm'], ['a.m.', 'p.m.'], u],
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
    [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'
    ]
  ],
  u,
  [['B', 'A'], ['BC', 'AD'], ['Before Christ', 'Anno Domini']],
  0,
  [6, 0],
  ['y-MM-dd', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
  ['{1}, {0}', u, '{1} \'at\' {0}', u],
  ['.', ',', ';', '%', '+', '-', 'e', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'CAD',
  '$',
  'Canadian Dollar',
  {'CAD': ['$'], 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
