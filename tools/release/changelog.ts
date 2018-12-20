import {bold, green, yellow} from 'chalk';
import {createReadStream, createWriteStream, readFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {Readable} from 'stream';

// These imports lack type definitions.
const conventionalChangelog = require('conventional-changelog');
const merge2 = require('merge2');

/** Prompts for a changelog release name and prepends the new changelog. */
export async function promptAndGenerateChangelog(changelogPath: string) {
  const releaseName = await promptChangelogReleaseName();
  await prependChangelogFromLatestTag(changelogPath, releaseName);
}

/**
 * Writes the changelog from the latest Semver tag to the current HEAD.
 * @param changelogPath Path to the changelog file.
 * @param releaseName Name of the release that should show up in the changelog.
 */
export async function prependChangelogFromLatestTag(changelogPath: string, releaseName: string) {
  const outputStream: Readable = conventionalChangelog(
    /* core options */ {preset: 'angular'},
    /* context options */ {title: releaseName},
    /* raw-commits options */ null,
    /* commit parser options */ null,
    /* writer options */ createChangelogWriterOptions(changelogPath));

  // Stream for reading the existing changelog. This is necessary because we want to
  // actually prepend the new changelog to the existing one.
  const previousChangelogStream = createReadStream(changelogPath);

  return new Promise((resolve, reject) => {
    // Sequentially merge the changelog output and the previous changelog stream, so that
    // the new changelog section comes before the existing versions. Afterwards, pipe into the
    // changelog file, so that the changes are reflected on file system.
    const mergedCompleteChangelog = merge2(outputStream, previousChangelogStream);

    // Wait for the previous changelog to be completely read because otherwise we would
    // read and write from the same source which causes the content to be thrown off.
    previousChangelogStream.on('end', () => {
      mergedCompleteChangelog.pipe(createWriteStream(changelogPath))
        .once('error', (error: any) => reject(error))
        .once('finish', () => resolve());
    });
  });
}

/** Prompts the terminal for a changelog release name. */
export async function promptChangelogReleaseName(): Promise<string> {
  return (await prompt<{releaseName: string}>({
    type: 'text',
    name: 'releaseName',
    message: 'What should be the name of the release?'
  })).releaseName;
}

/**
 * Creates changelog writer options which ensure that commits which are duplicated, or for
 * experimental packages do not showing up multiple times. Commits can show up multiple times
 * if a changelog has been generated on a publish branch and has been cherry-picked into "master".
 * In that case, the changelog will already contain cherry-picked commits from master which might
 * be added to future changelog's on "master" again. This is because usually patch and minor
 * releases are tagged from the publish branches and therefore conventional-changelog tries to
 * build the changelog from last major version to master's HEAD when a new major version is being
 * published from the "master" branch.
 */
function createChangelogWriterOptions(changelogPath: string) {
  const existingChangelogContent = readFileSync(changelogPath, 'utf8');

  return {
    // Specify a writer option that can be used to modify the content of a new changelog section.
    // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
    finalizeContext: (context: any) => {
      context.commitGroups = context.commitGroups.filter((group: any) => {
        group.commits = group.commits.filter((commit: any) => {

          // Commits that change things for "cdk-experimental" or "material-experimental" will also
          // show up in the changelog by default. We don't want to show these in the changelog.
          if (commit.scope && commit.scope.includes('experimental')) {
            console.log(yellow(`  ↺   Skipping experimental: "${bold(commit.header)}"`));
            return false;
          }

          // Filter out duplicate commits. Note that we cannot compare the SHA because the commits
          // will have a different SHA if they are being cherry-picked into a different branch.
          if (existingChangelogContent.includes(commit.subject)) {
            console.log(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`));
            return false;
          }
          return true;
        });

        // Filter out commit groups which don't have any commits. Commit groups will become
        // empty if we filter out all duplicated commits.
        return group.commits.length;
      });

      return context;
    }
  };
}

/** Entry-point for generating the changelog when called through the CLI. */
if (require.main === module) {
  promptAndGenerateChangelog(join(__dirname, '../../CHANGELOG.md')).then(() => {
    console.log(green('  ✓   Successfully updated the changelog.'));
  });
}


