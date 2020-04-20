/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

// THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// This is to ensure that we catch env issues before we error while requiring other dependencies.
const engines = require('./package.json').engines;
require('./tools/check-environment')({
  requiredNodeVersion: engines.node,
  requiredNpmVersion: engines.npm,
  requiredYarnVersion: engines.yarn
});

const gulp = require('gulp');

// See `tools/gulp-tasks/README.md` for information about task loading.
function loadTask(fileName, taskName) {
  const taskModule = require('./tools/gulp-tasks/' + fileName);
  const task = taskName ? taskModule[taskName] : taskModule;
  return task(gulp);
}


gulp.task('source-map-test', loadTask('source-map-test'));
gulp.task('changelog', loadTask('changelog'));
gulp.task('changelog:zonejs', loadTask('changelog-zonejs'));
gulp.task('check-env', () => {/* this is a noop because the env test ran already above */});
gulp.task('cldr:extract', loadTask('cldr', 'extract'));
gulp.task('cldr:gen-closure-locale', loadTask('cldr', 'closure'));


// TODO(josephperrott): Remove old task entries and deprecation notice after deprecation period.
/** Notify regarding `gulp format:*` deprecation. */
function gulpFormatDeprecationNotice() {
  console.info(`######################################################################`)
  console.info(`gulp format is deprecated in favor of running the formatter via ng-dev`);
  console.info();
  console.info(`You can find more usage information by running:`);
  console.info(`  yarn ng-dev format --help`);
  console.info();
  console.info(`For more on the rationale and effects of this deprecation visit:`);
  console.info(`  https://github.com/angular/angular/pull/36726#issue-406278018`);
  console.info(`######################################################################`)
  process.exit(1);
}
gulp.task('format:all', gulpFormatDeprecationNotice);
gulp.task('format:all:enforce', gulpFormatDeprecationNotice);
gulp.task('format:untracked', gulpFormatDeprecationNotice);
gulp.task('format:untracked:enforce', gulpFormatDeprecationNotice);
gulp.task('format:diff', gulpFormatDeprecationNotice);
gulp.task('format:diff:enforce', gulpFormatDeprecationNotice);
gulp.task('format:changed', gulpFormatDeprecationNotice);
gulp.task('format:changed:enforce', gulpFormatDeprecationNotice);
gulp.task('format', gulpFormatDeprecationNotice);
gulp.task('lint', gulpFormatDeprecationNotice);
