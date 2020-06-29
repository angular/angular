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
  'th',
  [['a', 'p'], ['ก่อนเที่ยง', 'หลังเที่ยง'], u],
  [['ก่อนเที่ยง', 'หลังเที่ยง'], u, u],
  [
    ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
    ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
    ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
  ],
  u,
  [
    [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.',
      'ธ.ค.'
    ],
    u,
    [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
      'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
  ],
  u,
  [['ก่อน ค.ศ.', 'ค.ศ.'], u, ['ปีก่อนคริสตกาล', 'คริสต์ศักราช']],
  0,
  [6, 0],
  ['d/M/yy', 'd MMM y', 'd MMMM G y', 'EEEEที่ d MMMM G y'],
  ['HH:mm', 'HH:mm:ss', 'H นาฬิกา mm นาที ss วินาที z', 'H นาฬิกา mm นาที ss วินาที zzzz'],
  ['{1} {0}', u, u, u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
  'THB',
  '฿',
  'บาท',
  {'AUD': ['AU$', '$'], 'THB': ['฿'], 'TWD': ['NT$'], 'USD': ['US$', '$'], 'XXX': []},
  'ltr',
  plural
];
