/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

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
gulp.task('cldr:extract', loadTask('cldr', 'extract'));
gulp.task('cldr:download', loadTask('cldr', 'download'));
gulp.task('cldr:gen-closure-locale', loadTask('cldr', 'closure'));
