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

//#######################################################
// A format and enforce task for different sets of files.
//#######################################################

// All source files.
gulp.task('format:all', loadTask('format', 'format'));
gulp.task('format:all:enforce', loadTask('format', 'enforce'));

// Untracked source code files.
gulp.task('format:untracked', loadTask('format', 'format-untracked'));
gulp.task('format:untracked:enforce', loadTask('format', 'enforce-untracked'));

// Changed, tracked source code files.
gulp.task('format:diff', loadTask('format', 'format-diff'));
gulp.task('format:diff:enforce', loadTask('format', 'enforce-diff'));

// Changed, both tracked and untracked, source code files.
gulp.task('format:changed', ['format:untracked', 'format:diff']);
gulp.task('format:changed:enforce', ['format:untracked:enforce', 'format:diff:enforce']);

// Alias for `format:changed` that formerly formatted all files.
gulp.task('format', ['format:changed']);

gulp.task('lint', ['format:changed:enforce']);
gulp.task('source-map-test', loadTask('source-map-test'));
gulp.task('changelog', loadTask('changelog'));
gulp.task('changelog:zonejs', loadTask('changelog-zonejs'));
gulp.task('check-env', () => {/* this is a noop because the env test ran already above */});
gulp.task('cldr:extract', loadTask('cldr', 'extract'));
gulp.task('cldr:gen-closure-locale', loadTask('cldr', 'closure'));
