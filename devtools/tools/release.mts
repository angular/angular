/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console
import {input} from '@inquirer/prompts';
import semver from 'semver';
import chalk from 'chalk';
import {writeFile, mkdir, rm, readFile} from 'node:fs/promises';
import {exec as nodeExec} from 'node:child_process';
import {promisify} from 'node:util';
import {join} from 'node:path';

const exec = promisify(nodeExec);

const execOptions = {maxBuffer: 10 * 1024 * 1024};

/** The repository root path */
const rootPath = join(import.meta.dirname, '../../');

/** The remote pointing to the official angular/angular repository. */
const angularRepoRemote = 'upstream';

/** The default branch of the official angular/angular repository. */
const defaultBranch = 'main';

/**
 * The commit message scope for all commits created by this script.
 * This is used to filter commits when generating the changelog.
 */
const commitScope = 'devtools';

/**
 * The prefix for all release commits created by this script.
 * This is used to filter commits when determining the last release.
 */
const releaseCommitPrefix = `release(${commitScope}):`;

/**
 * The path to the manifest files for the Chrome and Firefox extensions.
 * These files are updated with the new version number at the start of the release process.
 */
const manifestPaths = [
  'devtools/projects/shell-browser/src/manifest/manifest.chrome.json',
  'devtools/projects/shell-browser/src/manifest/manifest.firefox.json',
] as const;

/**
 * The path to the directory containing the built extension.
 * This is used to create the zip files for submission to the Chrome and Firefox stores.
 */
const extensionPath = 'dist/bin/devtools/projects/shell-browser/src/prodapp';

/**
 * The URL to the Angular DevTools page on the Chrome Web Store.
 * This is opened in the browser to allow the user to upload the Chrome extension.
 */
const chromeWebStoreUrl =
  'https://chrome.google.com/webstore/devconsole/19161719-4eee-48dc-959e-8d18cea83699/ienfalfjdbdpebioblfackkekamfmbnh/edit/package';

/**
 * The URL to the Angular DevTools page on the Firefox Add-ons page.
 * This is opened in the browser to allow the user to upload the Firefox extension.
 */
const firefoxAddonsUrl = 'https://addons.mozilla.org/en-US/developers/addon/angular-devtools/edit';

/**
 * The URL to the Google Authenticator app on the Google Play Store.
 * This is displayed to the user to help them set up two-factor authentication for the Firefox
 * Add-ons page.
 */
const googleAuthenticatorUrl =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';

/**
 * A regular expression that matches the commits that should be included in the changelog.
 * This is used to filter commits when generating the changelog.
 */
const commitRegex = new RegExp(`^(fix|feat|perf)\\(${commitScope}\\):`);

/**
 * The URL to the Google Group that manages publishing rights for the Chrome extension.
 * This is displayed to the user if they do not have permission to publish the extension.
 */
const publisherGoogleGroupUrl = 'http://g/angular-chrome-web-store-publisher';

/**
 * The URL to the Valentine page containing the credentials for the Firefox Add-ons page.
 * This is displayed to the user to help them log in to the Firefox Add-ons page.
 */
const firefoxCredentialsUrl = 'http://valentine/#/show/1651707871496288';

/**
 * The URL to the Valentine page containing the QR code for the Firefox Add-ons page.
 * This is displayed to the user to help them set up two-factor authentication.
 */
const firefox2faUrl = 'http://valentine/#/show/1651792043556329';

/**
 * The template for the reviewer note that is submitted with the Firefox extension.
 * This is displayed to the user to help them write the reviewer note.
 */
const firefoxReviewerNoteTemplate = `
This is a monorepo and includes much more code than just the DevTools extension. The relevant
code is under \`devtools/...\` and \`devtools/README.md\` contains instructions for compiling
release builds locally.

The uploaded source is equivalent to:
https://github.com/angular/angular/tree/RELEASE_COMMIT/.
`;

/**
 * The main function for the release script.
 * This function orchestrates the release process, from checking for new commits to publishing the extension.
 * It performs the following steps:
 * 1. Sets the working directory to the root of the repository.
 * 2. Ensures the working directory is clean.
 * 3. Fetches the latest changes from the official remote.
 * 4. Checks for new commits since the last release.
 * 5. Prompts the user for a new version number.
 * 6. Creates an output directory for the release artifacts.
 * 7. Updates the manifest files with the new version number.
 * 8. Creates a new branch and commits the version bump.
 * 9. Waits for the user to merge the release PR and get the SHA of the merged commit.
 * 10. Publishes the Chrome extension.
 * 11. Publishes the Firefox extension.
 * 12. Logs a success message.
 */
async function main(): Promise<void> {
  process.chdir(rootPath);

  // Ensure the user has a clean working directory before starting the release process.
  await checkCleanWorkingDirectory();

  // Fetch the latest changes from the official remote.
  console.log(chalk.blue('Fetching latest changes from upstream...'));
  await exec(`git fetch ${angularRepoRemote}`);
  console.log(chalk.green('Successfully fetched latest changes.'));

  // Check if there are any new commits to release.
  console.log(chalk.blue('Checking for new commits to release...'));
  const lastReleaseSha = await getLastReleaseSha();
  const commits = await getCommitsSince(lastReleaseSha);

  if (commits.length === 0) {
    console.log(chalk.yellow('No new commits to release. Exiting.'));
    return;
  }

  console.log(chalk.green('New commits to release:'));
  for (const commit of commits) {
    console.log(`- ${commit}`);
  }
  console.log('');

  // Get the new version number from the user.
  const newVersion = await getNewVersion(commits);

  const outputDir = `dist/devtools-release-v${newVersion}`;
  console.log(chalk.blue(`Creating output directory: ${outputDir}`));
  await rm(outputDir, {force: true, recursive: true});
  await mkdir(outputDir, {recursive: true});
  console.log(chalk.green(`Created output directory: ${outputDir}`));

  const chromeZipPath = join(outputDir, 'devtools-chrome.zip');
  const firefoxZipPath = join(outputDir, 'devtools-firefox.zip');
  const sourceZipPath = join(outputDir, 'angular-source.zip');

  // Update the manifest files with the new version number.
  await updateManifests(newVersion);

  // Create a new branch and commit the version bump.
  await createReleaseCommit(newVersion);

  // Wait for the user to merge the release PR and get the SHA of the merged commit.
  const mergedCommitSha = await promptForMergedCommitSha();
  await checkoutMergedCommitAndInstallDependencies(mergedCommitSha);

  // Publish the Chrome extension.
  await publishChromeExtension(chromeZipPath);

  // Publish the Firefox extension.
  await publishFirefoxExtension(mergedCommitSha, firefoxZipPath, sourceZipPath, commits);

  console.log(chalk.green('DevTools release process complete!'));
}

/**
 * Checks that the working directory is clean.
 * If the working directory is not clean, the user is prompted to continue or exit.
 * @throws An error if the user chooses to exit.
 */
async function checkCleanWorkingDirectory(): Promise<void> {
  console.log(chalk.blue('Checking for a clean working directory...'));
  const {stdout: status} = await exec('git status --porcelain');
  if (status.length > 0) {
    throw new Error('Your working directory is not clean. There are uncommitted changes.');
  }
  console.log(chalk.green('Working directory is clean.'));
}

/**
 * Gets the SHA of the last release commit.
 * This is used to determine which commits to include in the changelog.
 * @returns A promise that resolves to the SHA of the last release commit.
 */
async function getLastReleaseSha(): Promise<string> {
  const {stdout} = await exec(
    `git log ${angularRepoRemote}/${defaultBranch} --grep="${releaseCommitPrefix}" --format=format:%H -n 1`,
  );

  return 'c9b215bb5c83aeba99a0a2a581ae7dcc0f503020';
  return stdout.trim();
}

/**
 * Gets the commits since a given SHA.
 * This is used to determine which commits to include in the changelog.
 * @param since The SHA of the commit to start from.
 * @returns A promise that resolves to a list of commit messages since the given SHA.
 */
async function getCommitsSince(since: string): Promise<string[]> {
  const {stdout} = await exec(
    `git log HEAD...${since} --grep="${commitScope}" --format=format:%s`,
    execOptions,
  );

  return stdout
    .trim()
    .split('\n')
    .filter((line) => line.length > 0 && commitRegex.test(line));
}

/**
 * Gets the new version number from the user.
 * This function reads the current version from the manifest files, determines the next version based on the commits since the last release, and then prompts the user to confirm the new version.
 * @param commits A list of commit messages since the last release.
 * @returns A promise that resolves to the new version number.
 */
async function getNewVersion(commits: string[]): Promise<string> {
  console.log(chalk.blue('Determining new version...'));
  const currentVersion = await getCurrentVersion();
  const releaseType = determineReleaseType(commits);
  const suggestedVersion = semver.inc(currentVersion, releaseType) ?? currentVersion;

  const newVersion = await input({
    message: 'Enter the new version number',
    default: suggestedVersion,
    validate: (value) => {
      if (!semver.valid(value)) {
        return chalk.red('Please enter a valid version number.');
      }
      if (semver.lte(value, currentVersion)) {
        return chalk.red(
          `Please enter a version number greater than the current version (${currentVersion}).`,
        );
      }
      return true;
    },
  });

  console.log(chalk.green(`New version set to: ${newVersion}`));
  return newVersion;
}

/**
 * Gets the current version number from the manifest files.
 * This function reads the version from the first manifest file and assumes that all manifest files have the same version.
 * @returns A promise that resolves to the current version number.
 */
async function getCurrentVersion(): Promise<string> {
  const manifest = JSON.parse(await readFile(manifestPaths[0], 'utf-8'));
  return manifest.version;
}

/**
 * Determines the release type based on the commits since the last release.
 * This function looks for "feat" and "fix" commits to determine whether the release should be a minor or patch release.
 * @param commits A list of commit messages since the last release.
 * @returns The release type ('patch' or 'minor').
 */
function determineReleaseType(commits: string[]): 'patch' | 'minor' {
  return commits.some((commit) => commit.startsWith('feat')) ? 'minor' : 'patch';
}

/**
 * Updates the manifest files with the new version number.
 * This function reads each manifest file, updates the version number, and then writes the file back to disk.
 * @param newVersion The new version number.
 * @returns A promise that resolves when all manifest files have been updated.
 */
async function updateManifests(newVersion: string): Promise<void> {
  console.log(chalk.blue(`Updating manifest files to version ${newVersion}...`));
  for (const manifestPath of manifestPaths) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
    manifest.version = newVersion;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Updated ${manifestPath}`);
  }
  console.log(chalk.green('Manifest files updated successfully.'));
}

/**
 * Creates a new branch and commits the version bump.
 * This function creates a new branch, stages the changes to the manifest files, commits the changes, and then pushes the branch to the user's fork.
 * @param newVersion The new version number.
 * @returns A promise that resolves when the release commit has been created and pushed.
 */
async function createReleaseCommit(newVersion: string): Promise<void> {
  console.log(chalk.blue('Creating release commit...'));
  const releaseBranch = `devtools-release-${newVersion}`;
  await exec(`git checkout -b ${releaseBranch}`);
  await exec(`git add ${manifestPaths.join(' ')}`);
  await exec(`git commit -m "${releaseCommitPrefix} ${newVersion}"`);
  await exec(`git push -u origin ${releaseBranch} --force-with-lease`);
  console.log(chalk.green('Release branch pushed to your fork.'));
  console.log(chalk.yellow('Please create a pull request and merge it.'));
}

/**
 * Prompts the user to enter the SHA of the merged release commit and validates it.
 * @returns A promise that resolves to the SHA of the merged commit.
 */
async function promptForMergedCommitSha(): Promise<string> {
  console.log('Waiting for release PR to be merged...');
  const mergedCommitSha = await input({
    message: 'Enter the SHA of the merged release commit',
    validate: async (value) => {
      try {
        await exec(`git show --quiet ${value}`);
        return true;
      } catch {
        return chalk.red('Please enter a valid commit SHA.');
      }
    },
  });
  return mergedCommitSha;
}

/**
 * Checks out the merged commit and installs dependencies.
 * @param mergedCommitSha The SHA of the merged release commit.
 */
async function checkoutMergedCommitAndInstallDependencies(mergedCommitSha: string): Promise<void> {
  console.log(
    chalk.blue(`Checking out merged commit ${mergedCommitSha} and installing dependencies...`),
  );
  await exec(`git checkout ${mergedCommitSha}`);
  await exec(`pnpm install --frozen-lockfile`);
  console.log(chalk.green('Successfully checked out merged commit and installed dependencies.'));
}

/**
 * Publishes the Chrome extension.
 * This function builds the Chrome extension, packages it, and then opens the Chrome Web Store in the browser.
 * @param chromeZipPath The absolute path where the Chrome extension zip file will be created.
 * @returns A promise that resolves when the Chrome extension has been built and packaged.
 */
async function publishChromeExtension(chromeZipPath: string): Promise<void> {
  console.log(chalk.blue('\nBuilding Chrome extension...'));
  await exec('pnpm devtools:build:chrome:release');
  await exec(`zip -r ${join(rootPath, chromeZipPath)} *`, {
    cwd: extensionPath,
  });
  console.log(chalk.green(`Chrome extension packaged at ${chromeZipPath}`));
  console.log(chalk.yellow('Please upload the extension to the Chrome Web Store.'));
  console.log(`You can do so here: ${chromeWebStoreUrl}`);
  console.log(`Make sure you are a member of the publisher group: ${publisherGoogleGroupUrl}`);
}

/**
 * Publishes the Firefox extension.
 * This function builds the Firefox extension, packages it, and then opens the Firefox Add-ons page in the browser.
 * It also packages the source code and generates the changelog and reviewer note.
 * @param mergedCommitSha The SHA of the merged release commit.
 * @param firefoxZipPath The absolute path where the Firefox extension zip file will be created.
 * @param sourceZipPath The absolute path where the source code zip file will be created.
 * @param commits A list of commit messages since the last release.
 * @returns A promise that resolves when the Firefox extension has been built and packaged.
 */
async function publishFirefoxExtension(
  mergedCommitSha: string,
  firefoxZipPath: string,
  sourceZipPath: string,
  commits: string[],
): Promise<void> {
  console.log(chalk.blue('\nBuilding Firefox extension...'));
  await exec('pnpm devtools:build:firefox:release');
  await exec(`zip -r ${join(rootPath, firefoxZipPath)} *`, {
    cwd: extensionPath,
  });
  console.log(chalk.green(`Firefox extension packaged at ${firefoxZipPath}`));

  console.log(chalk.blue('Packaging source code...'));
  await exec(`git archive HEAD -o ${sourceZipPath}`);
  console.log(chalk.green(`Source code packaged at ${sourceZipPath}`));
  console.log('');

  const changelog = await generateChangelog(commits);
  console.log(chalk.blue('Changelog:'));
  console.log(changelog);
  console.log('');

  const reviewerNote = firefoxReviewerNoteTemplate.replace('RELEASE_COMMIT', mergedCommitSha);
  console.log(chalk.blue('Reviewer note:'));
  console.log(reviewerNote);
  console.log('');

  console.log(chalk.yellow('Please upload the extension to the Firefox Add-ons page.'));
  console.log(`You can do so here: ${firefoxAddonsUrl}`);
  console.log(
    `This will require a 2FA code, which you can generate by installing Google Authenticator: ${googleAuthenticatorUrl}`,
  );
  console.log(`Login credentials: ${firefoxCredentialsUrl}`);
  console.log(`2FA QR code: ${firefox2faUrl}`);
  console.log('');
}

/**
 * Generates the changelog for the release.
 * This function gets the commits since the last release and formats them into a changelog.
 * @param commits A list of commit messages since the last release.
 * @returns A promise that resolves to the changelog for the release.
 */
async function generateChangelog(commits: string[]): Promise<string> {
  return commits
    .map(
      (commit) =>
        `* ${commit.replace(/\(#(\d+)\)/, '([#$1](https://github.com/angular/angular/pull/$1))')}`,
    )
    .join('\n');
}

// Start the release process.
main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
