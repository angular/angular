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
  'as',
  [
    ['পূৰ্বাহ্ণ', 'অপৰাহ্ণ'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি'],
    ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহষ্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ'],
    ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি']
  ],
  ,
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ['জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'],
    [
      'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ',
      'নৱেম্বৰ', 'ডিচেম্বৰ'
    ]
  ],
  ,
  [
    ['BCE', 'CE'],
    ,
  ],
  0, [0, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  [
    '{1} {0}',
    ,
    ,
  ],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'], '₹', 'INR',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1) return 1;
        return 5;
      }
];
