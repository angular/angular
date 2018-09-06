/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = (gulp) => () => {
  const conventionalChangelog = require('gulp-conventional-changelog');
  return gulp.src('CHANGELOG.md')
      .pipe(conventionalChangelog({preset: 'angular'}))
      .pipe(gulp.dest('./'));
};
