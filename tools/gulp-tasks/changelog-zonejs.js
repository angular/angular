/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

module.exports = (gulp) => () => {
  const tag = process.env.TAG;
  const ptag = process.env.PREVIOUS_ZONE_TAG;
  const conventionalChangelog = require('gulp-conventional-changelog');
  // the tag of zone.js will start with `zone.js-`, such as `zone.js-0.10.0`
  // we will remove the first 8 (zone.js-) chars to get the real version.
  const version = tag.replace(/^zone\.js-/, '');
  return gulp
    .src('packages/zone.js/CHANGELOG.md')
    .pipe(
      conventionalChangelog(
        {
          preset: 'angular',
        },
        {linkCompare: true, previousTag: ptag, currentTag: tag, version: version},
        {
          // Ignore commits that have a different scope than `zone.js`.
          extendedRegexp: true,
          grep: '^[^(]+\\(zone\\.js\\)',
          from: ptag,
          to: 'HEAD',
        },
      ),
    )
    .pipe(gulp.dest('./packages/zone.js/'));
};
