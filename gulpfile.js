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
gulp.task('format:untracked', loadTask('format', 'format-untracked'));
gulp.task('format:diff', loadTask('format', 'format-diff'));
gulp.task('format:changed', ['format:untracked', 'format:diff']);
gulp.task('build.sh', loadTask('build', 'all'));
gulp.task('build.sh:no-bundle', loadTask('build', 'no-bundle'));
gulp.task('lint', ['format:enforce', 'validate-commit-messages', 'tslint']);
gulp.task('tslint', ['tools:build'], loadTask('lint'));
gulp.task('validate-commit-messages', loadTask('validate-commit-message'));
gulp.task('source-map-test', loadTask('source-map-test'));
gulp.task('tools:build', loadTask('tools-build'));
gulp.task('check-cycle', loadTask('check-cycle'));
gulp.task('serve', loadTask('serve', 'default'));
gulp.task('serve-examples', loadTask('serve', 'examples'));
gulp.task('changelog', loadTask('changelog'));
gulp.task('check-env', () => {/* this is a noop because the env test ran already above */});
gulp.task('cldr:extract', loadTask('cldr', 'extract'));
gulp.task('cldr:download', loadTask('cldr', 'download'));
gulp.task('cldr:gen-closure-locale', loadTask('cldr', 'closure'));
