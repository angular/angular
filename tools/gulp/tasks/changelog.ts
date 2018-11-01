import {grey, red, yellow} from 'chalk';
import {readFileSync} from 'fs';
import {dest, src, task} from 'gulp';
import {prompt} from 'inquirer';
import {buildConfig} from 'material2-build-tools';
import {join} from 'path';

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

  const {releaseName} = await prompt<{releaseName: string}>({
    type: 'text',
    name: 'releaseName',
    message: 'What should be the name of the release?'
  });

  return src(changelogFile)
    .pipe(gulpChangelog(changelogOptions, {title: releaseName}, null, null,
        createDedupeWriterOptions()))
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

/**
 * Creates changelog writer options which ensure that commits are not showing up multiple times.
 *
 * Commits can show up multiple times, if a changelog has been generated on a publish branch
 * and has been copied over to "master". In that case, the changelog will already contain the
 * commits that have been cherry-picked into the publish branch. These shouldn't be added twice.
 */
function createDedupeWriterOptions() {
  const previousContent = readFileSync(changelogFile, 'utf8');

  return {
    // Change writer option that can be used to modify the content of a new changelog section.
    // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
    finalizeContext: (context: any) => {
      context.commitGroups.forEach((group: any) => {
        group.commits = group.commits.filter((commit: any) => {
          // Note that we cannot compare the SHA's because the commits will have a different SHA
          // if they are being cherry-picked into a different branch.
          if (previousContent.includes(commit.header)) {
            console.log(grey(`Skipping: "${commit.header}" (${commit.hash})`));
            return false;
          }
          return true;
        });
      });
      return context;
    }
  };
}
