/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = (gulp) => () => {
  const tag = process.env.ZONE_TAG;
  const conventionalChangelog = require('gulp-conventional-changelog');
  return gulp.src('packages/zone.js/CHANGELOG.md')
      .pipe(conventionalChangelog(
          {preset: 'angular'}, {
            currentTag: tag,
          },
          {
            // Ignore commits that have a different scope than `zone.js`.
            extendedRegexp: true,
            grep: '^[^(]+\\(zone\\.js\\)',
          }))
      .pipe(gulp.dest('./packages/zone.js/'));
};
