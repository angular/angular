// clang-format entry points
const srcsToFmt = [
  'packages/**/*.{js,ts}',
  'modules/benchmarks/**/*.{js,ts}',
  'modules/e2e_util/**/*.{js,ts}',
  'modules/playground/**/*.{js,ts}',
  'tools/**/*.{js,ts}',
  '!tools/public_api_guard/**/*.d.ts',
  './*.{js,ts}',
  '!shims_for_IE.js',
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
