/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const {readFileSync} = require('fs');
const {bold, yellow} = require('chalk');

module.exports = (gulp) => () => {
  const conventionalChangelog = require('gulp-conventional-changelog');
  const ignoredScopes = [
    'aio',
    'dev-infra',
    'docs-infra',
    'zone.js',
  ];

  return gulp.src('CHANGELOG.md')
      .pipe(conventionalChangelog(
          /* core options */ {preset: 'angular'},
          /* context options */ {},
          /* raw-commit options */ {
            // Ignore commits that start with `<type>(<scope>)` for any of the ignored scopes.
            extendedRegexp: true,
            grep: `^[^(]+\\((${ignoredScopes.join('|')})\\)`,
            invertGrep: true,
          },
          /* commit parser options */ null,
          /* writer options*/ createDedupeWriterOptions()))
      .pipe(gulp.dest('./'));
};

/**
 * Creates changelog writer options which ensure that commits are not showing up multiple times.
 * Commits can show up multiple times if a changelog has been generated on a publish branch
 * and has been cherry-picked into "master". In that case, the changelog will already contain
 * commits from master which might be added to the changelog again. This is because usually
 * patch and minor releases are tagged from the publish branches and therefore
 * conventional-changelog tries to build the changelog from last minor version to HEAD when a
 * new minor version is being published from the "master" branch. We naively match commit
 * headers as otherwise we would need to query Git and diff commits between a given patch branch.
 * The commit header is reliable enough as it contains a direct reference to the source PR.
 */
function createDedupeWriterOptions() {
  const existingChangelogContent = readFileSync('CHANGELOG.md', 'utf8');

  return {
    // Specify a writer option that can be used to modify the content of a new changelog section.
    // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
    finalizeContext: (context) => {
      context.commitGroups = context.commitGroups.filter((group) => {
        group.commits = group.commits.filter((commit) => {
          // NOTE: We cannot compare the SHAs because the commits will have a different SHA
          // if they are being cherry-picked into a different branch.
          if (existingChangelogContent.includes(commit.subject)) {
            console.info(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`));
            return false;
          }
          return true;
        });

        // Filter out commit groups which don't have any commits. Commit groups will become
        // empty if we filter out all duplicated commits.
        return group.commits.length !== 0;
      });

      return context;
    }
  };
}
