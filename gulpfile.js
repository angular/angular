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

gulp.task('format:enforce', loadTask('format', 'enforce'));
gulp.task('format', loadTask('format', 'format'));
gulp.task('build.sh', loadTask('build'));
gulp.task('public-api:enforce', loadTask('public-api', 'enforce'));
gulp.task('public-api:update', ['build.sh'], loadTask('public-api', 'update'));
gulp.task('lint', ['format:enforce', 'validate-commit-messages', 'tslint']);
gulp.task('tslint', ['tools:build'], loadTask('lint'));
gulp.task('validate-commit-messages', loadTask('validate-commit-message'));
gulp.task('tools:build', loadTask('tools-build'));
gulp.task('check-cycle', loadTask('check-cycle'));
gulp.task('serve', loadTask('serve', 'default'));
gulp.task('serve-examples', loadTask('serve', 'examples'));
gulp.task('changelog', loadTask('changelog'));
gulp.task('check-env', () => {/* this is a noop because the env test ran already above */});
