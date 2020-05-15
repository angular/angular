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
  if (n === 1) return 1;
  return 5;
}

export default [
  'ta-LK',
  [['மு.ப', 'பி.ப'], ['முற்பகல்', 'பிற்பகல்'], u],
  u,
  [
    ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
    ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
    ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
    ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச']
  ],
  u,
  [
    ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
    ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
    [
      'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்',
      'டிசம்பர்'
    ]
  ],
  u,
  [['கி.மு.', 'கி.பி.'], u, ['கிறிஸ்துவுக்கு முன்', 'அன்னோ டோமினி']],
  1,
  [6, 0],
  ['d/M/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, d MMMM, y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1}, {0}', u, '{1} ’அன்று’ {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'],
  'LKR',
  'Rs.',
  'இலங்கை ரூபாய்',
  {'LKR': ['Rs.', 'Rs'], 'THB': ['฿'], 'TWD': ['NT$']},
  'ltr',
  plural
];
