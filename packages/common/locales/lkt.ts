/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  return 5;
}

export default [
  'lkt', [['AM', 'PM'], u, u], u,
  [
    ['A', 'W', 'N', 'Y', 'T', 'Z', 'O'],
    [
      'Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa',
      'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'
    ],
    u, u
  ],
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    [
      'Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa',
      'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'
    ],
    u, u
  ],
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    [
      'Wiótheȟika Wí', 'Thiyóȟeyuŋka Wí', 'Ištáwičhayazaŋ Wí', 'Pȟežítȟo Wí',
      'Čhaŋwápetȟo Wí', 'Wípazukȟa-wašté Wí', 'Čhaŋpȟásapa Wí', 'Wasútȟuŋ Wí',
      'Čhaŋwápeǧi Wí', 'Čhaŋwápe-kasná Wí', 'Waníyetu Wí', 'Tȟahékapšuŋ Wí'
    ],
    u
  ],
  u, [['BCE', 'CE'], u, u], 0, [6, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], '$', 'USD', {'JPY': ['JP¥', '¥']}, plural
];
