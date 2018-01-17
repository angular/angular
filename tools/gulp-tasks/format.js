/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const {I18N_FOLDER, I18N_DATA_FOLDER} = require('./cldr/extract');

// clang-format entry points
const srcsToFmt = [
  'packages/**/*.{js,ts}',
  'modules/benchmarks/**/*.{js,ts}',
  'modules/e2e_util/**/*.{js,ts}',
  'modules/playground/**/*.{js,ts}',
  'tools/**/*.{js,ts}',
  '!tools/public_api_guard/**/*.d.ts',
  './*.{js,ts}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/built/**',
  '!shims_for_IE.js',
  `!${I18N_DATA_FOLDER}/**/*.{js,ts}`,
  `!${I18N_FOLDER}/available_locales.ts`,
  `!${I18N_FOLDER}/currencies.ts`,
  `!${I18N_FOLDER}/locale_en.ts`,
  '!tools/gulp-tasks/cldr/extract.js',
];

module.exports = {
  // Check source code for formatting errors (clang-format)
  enforce: (gulp) => () => {
    const format = require('gulp-clang-format');
    const clangFormat = require('clang-format');
    return gulp.src(srcsToFmt).pipe(
        format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
  },

  // Format the source code with clang-format (see .clang-format)
  format: (gulp) => () => {
    const format = require('gulp-clang-format');
    const clangFormat = require('clang-format');
    return gulp.src(srcsToFmt, {base: '.'})
        .pipe(format.format('file', clangFormat))
        .pipe(gulp.dest('.'));
  }
};
