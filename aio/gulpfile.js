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
// NOTE: we are getting the value from the parent `angular/angular` package.json not the `/aio` one.
const engines = require('../package.json').engines;
require('../tools/check-environment')({
  requiredNodeVersion: engines.node,
  requiredNpmVersion: engines.npm,
  requiredYarnVersion: engines.yarn
});

const gulp = require('gulp');

// See `tools/gulp-tasks/README.md` for information about task loading.
function loadTask(fileName, taskName) {
  const taskModule = require('./build/' + fileName);
  const task = taskName ? taskModule[taskName] : taskModule;
  return task(gulp);
}

gulp.task('docs', ['doc-gen', 'docs-app']);
gulp.task('doc-gen', loadTask('docs', 'generate'));
gulp.task('doc-gen-test', loadTask('docs', 'test'));
gulp.task('docs-app', loadTask('docs-app'));
gulp.task('docs-app-test', () => {});
gulp.task('docs-test', ['doc-gen-test', 'docs-app-test']);
gulp.task('check-env', () => { /* this is a noop because the env test ran already above */ });
