import {task, src, dest} from 'gulp';
import {buildConfig} from 'material2-build-tools';
import {join} from 'path';
import {yellow, red} from 'chalk';

// This imports lack of type definitions.
const gulpChangelog = require('gulp-conventional-changelog');
const gitSemverTags = require('git-semver-tags');

/** Path to the changelog markdown file of the project. */
const changelogFile = join(buildConfig.projectDir, 'CHANGELOG.md');

/** Default changelog options that are passed to gulp-conventional-changelog. */
const changelogOptions = { preset: 'angular' };

/** Task that generates a new changelog section from the latest tag to HEAD. */
task('changelog', async () => {
  // Show the instructions for the changelog generation.
  showChangelogInstructions();

  // Cancel the generation when the latest tag is the same as the version from the "package.json".
  if (await getLatestSemverTag() === buildConfig.projectVersion) {
    console.error(red('Warning: Changelog won\'t change because the "package.json" version is ' +
        'equal to the latest Git tag.\n'));
    return;
  }

  return src(changelogFile)
    .pipe(gulpChangelog(changelogOptions))
    .pipe(dest('./'));
});

/** Task that re-generates the full changelog. */
task('changelog:full', () => {
  return src(changelogFile)
    .pipe(gulpChangelog({ ...changelogOptions, releaseCount: 0 }))
    .pipe(dest('./'));
});

/** Prints a message that gives instructions about generating a changelog section. */
function showChangelogInstructions() {
  console.info(`
    ${yellow('Changelog Instructions')}

    When running this command, the changelog from the latest tag to HEAD will be generated.
    The name of the new changelog section will be taken from the "package.json" version.

    The recommended steps when creating a new changelog section:
      1. Bump the version in the "package.json"
      2. Run the changelog gulp task
      3. Tweak the changelog manually.
  `);
}

/** Returns the latest Semver Tag from the project Git repository */
function getLatestSemverTag(): Promise<string> {
  return new Promise((resolve, reject) => {
    return gitSemverTags((err: Error, tags: string[]) => err ? reject(err) : resolve(tags[0]));
  });
}
