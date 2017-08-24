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
  'ce',
  [
    ['AM', 'PM'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['кӀиранан де', 'оршотан де', 'шинарин де', 'кхаарин де', 'еарин де', 'пӀераскан де', 'шот де'],
    ,
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь',
      'ноябрь', 'декабрь'
    ]
  ],
  ,
  [
    ['BCE', 'CE'],
    ,
  ],
  1, [6, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'Терхьаш дац', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], '₽', 'Российн сом', function(n: number):
                                                                           number {
                                                                             if (n === 1) return 1;
                                                                             return 5;
                                                                           }
];
