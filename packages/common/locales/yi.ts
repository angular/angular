/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

export default [
  'yi',
  [
    ['פֿאַרמיטאָג', 'נאָכמיטאָג'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
    ,
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער',
      'אקטאבער', 'נאוועמבער', 'דעצעמבער'
    ],
  ],
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['יאַנ', 'פֿעב', 'מערץ', 'אַפּר', 'מיי', 'יוני', 'יולי', 'אויג', 'סעפּ', 'אקט', 'נאוו', 'דעצ'],
    [
      'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער',
      'אקטאבער', 'נאוועמבער', 'דעצעמבער'
    ]
  ],
  [
    ['BCE', 'CE'],
    ,
  ],
  1, [6, 0], ['dd/MM/yy', 'dטן MMM y', 'dטן MMMM y', 'EEEE, dטן MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    '{1}, {0}',
    '{1} {0}',
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], ,
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        return 5;
      }
];
