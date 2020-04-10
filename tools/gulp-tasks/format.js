/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const {I18N_FOLDER, I18N_DATA_FOLDER} = require('./cldr/extract');

// Glob matches for files to be automatically formatted.
const srcsToFmt = [
  'dev-infra/**/*.{js,ts}',
  'packages/**/*.{js,ts}',
  '!packages/zone.js', // Ignore the `zone.js/` directory itself. (The contents are still matched.)
  `!${I18N_DATA_FOLDER}/**/*.{js,ts}`,
  `!${I18N_FOLDER}/available_locales.ts`,
  `!${I18N_FOLDER}/currencies.ts`,
  `!${I18N_FOLDER}/locale_en.ts`,
  'modules/benchmarks/**/*.{js,ts}',
  'modules/e2e_util/**/*.{js,ts}',
  'modules/playground/**/*.{js,ts}',
  'tools/**/*.{js,ts}',
  '!tools/gulp-tasks/cldr/extract.js',
  '!tools/public_api_guard/**/*.d.ts',
  '!tools/ts-api-guardian/test/fixtures/**',
  './*.{js,ts}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/built/**',
  '!shims_for_IE.js',
];

/**
 * Gulp stream that wraps the gulp-git status,
 * only returns untracked files, and converts
 * the stdout into a stream of files.
 */
function gulpStatus() {
  const Vinyl = require('vinyl');
  const path = require('path');
  const gulpGit = require('gulp-git');
  const through = require('through2');
  const srcStream = through.obj();

  const opt = {cwd: process.cwd()};

  // https://git-scm.com/docs/git-status#_short_format
  const RE_STATUS = /((\s\w)|(\w+)|\?{0,2})\s([\w\+\-\/\\\.]+)(\s->\s)?([\w\+\-\/\\\.]+)*\n{0,1}/gm;

  gulpGit.status({args: '--porcelain', quiet: true}, function (err, stdout) {
    if (err) return srcStream.emit('error', err);

    const data = stdout.toString();
    let currentMatch;

    while ((currentMatch = RE_STATUS.exec(data)) !== null) {
      // status
      const status = currentMatch[1].trim().toLowerCase();

      // We only care about untracked files and renamed files
      if (!new RegExp(/r|\?/i).test(status)) {
        continue;
      }

      // file path
      const currentFilePath = currentMatch[4];

      // new file path in case its been moved
      const newFilePath = currentMatch[6];
      const filePath = newFilePath || currentFilePath;

      srcStream.write(
        new Vinyl({
          path: path.resolve(opt.cwd, filePath),
          cwd: opt.cwd,
        })
      );

      RE_STATUS.lastIndex++;
    }

    srcStream.end();
  });

  return srcStream;
}

module.exports = {
  // Check source code for formatting errors
  enforce: (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    return gulp.src(srcsToFmt).pipe(prettier.check(prettierConfig));
  },

  // Check only the untracked source code files for formatting errors
  'enforce-untracked': (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    const gulpFilter = require('gulp-filter');

    return gulpStatus().pipe(gulpFilter(srcsToFmt)).pipe(prettier.check(prettierConfig));
  },

  // Check only the changed source code files diffed from the provided branch for formatting
  // errors
  'enforce-diff': (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    const gulpFilter = require('gulp-filter');
    const minimist = require('minimist');
    const gulpGit = require('gulp-git');

    const args = minimist(process.argv.slice(2));
    const branch = args.branch || 'master';

    return gulpGit
      .diff(branch, {log: false})
      .pipe(gulpFilter(srcsToFmt))
      .pipe(prettier.check(prettierConfig));
  },

  // Format the source code
  format: (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    return gulp
      .src(srcsToFmt)
      .pipe(prettier(prettierConfig))
      .pipe(gulp.dest((file) => file.base));
  },

  // Format only the untracked source code files
  'format-untracked': (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    const gulpFilter = require('gulp-filter');

    return gulpStatus()
      .pipe(gulpFilter(srcsToFmt))
      .pipe(prettier(prettierConfig))
      .pipe(gulp.dest((file) => file.base));
  },

  // Format only the changed source code files diffed from the provided branch
  'format-diff': (gulp) => () => {
    const prettierConfig = require('../../package.json').prettier;
    const prettier = require('gulp-prettier');
    const gulpFilter = require('gulp-filter');
    const minimist = require('minimist');
    const gulpGit = require('gulp-git');

    const args = minimist(process.argv.slice(2));
    const branch = args.branch || 'master';

    return gulpGit
      .diff(branch, {log: false})
      .pipe(gulpFilter(srcsToFmt))
      .pipe(prettier(prettierConfig))
      .pipe(gulp.dest((f) => f.base));
  },
};
