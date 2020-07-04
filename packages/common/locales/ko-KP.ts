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
  return 5;
}

export default [
  'ko-KP',
  [['AM', 'PM'], u, ['오전', '오후']],
  u,
  [
    ['일', '월', '화', '수', '목', '금', '토'], u,
    ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    ['일', '월', '화', '수', '목', '금', '토']
  ],
  u,
  [['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], u, u],
  u,
  [['BC', 'AD'], u, ['기원전', '서기']],
  1,
  [6, 0],
  ['yy. M. d.', 'y. M. d.', 'y년 M월 d일', 'y년 M월 d일 EEEE'],
  ['a h:mm', 'a h:mm:ss', 'a h시 m분 s초 z', 'a h시 m분 s초 zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'KPW',
  'KPW',
  '조선 민주주의 인민 공화국 원',
  {'AUD': ['AU$', '$'], 'JPY': ['JP¥', '¥'], 'RON': [u, 'L'], 'TWD': ['NT$'], 'USD': ['US$', '$']},
  'ltr',
  plural
];
