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

// Check source code for formatting errors in all source files.
gulp.task('format:enforce', loadTask('format', 'enforce'));

// Format all source files.
gulp.task('format:all', loadTask('format', 'format'));

// Format only untracked source code files.
gulp.task('format:untracked', loadTask('format', 'format-untracked'));

// Format only the changed, tracked source code files.
gulp.task('format:diff', loadTask('format', 'format-diff'));

// Format only changed lines based on the diff from the provided --branch
// argument (or `master` by default).
gulp.task('format:changed', ['format:untracked', 'format:diff']);

// Alias for `format:changed` that formerly formatted all files.
gulp.task('format', ['format:changed']);

gulp.task('lint', ['format:enforce', 'validate-commit-messages', 'tslint']);
gulp.task('tslint', ['tools:build'], loadTask('lint'));
gulp.task('validate-commit-messages', loadTask('validate-commit-message'));
gulp.task('source-map-test', loadTask('source-map-test'));
gulp.task('tools:build', loadTask('tools-build'));
gulp.task('check-cycle', loadTask('check-cycle'));
gulp.task('serve', loadTask('serve', 'default'));
gulp.task('changelog', loadTask('changelog'));
gulp.task('changelog:zonejs', loadTask('changelog-zonejs'));
gulp.task('check-env', () => {/* this is a noop because the env test ran already above */});
gulp.task('cldr:extract', loadTask('cldr', 'extract'));
gulp.task('cldr:download', loadTask('cldr', 'download'));
gulp.task('cldr:gen-closure-locale', loadTask('cldr', 'closure'));
