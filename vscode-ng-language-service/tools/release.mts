/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This script orchestrates the release process for the Angular Language Service VSCode extension.
 * It handles versioning, changelog generation, building, and publishing the extension.
 */

// tslint:disable:no-console
import {input} from '@inquirer/prompts';
import chalk from 'chalk';
import semver from 'semver';
import {writeFile, readFile} from 'node:fs/promises';
import {exec as nodeExec, spawn, SpawnOptions} from 'node:child_process';
import {promisify} from 'node:util';
import {join} from 'node:path';

const exec = promisify(nodeExec);

/** Additional Bazel arguments for release builds to ensure colored output and display progress. */
const additionBazelReleaseArgs = [
  '--color=yes',
  '--curses=yes',
  '--show_progress_rate_limit=5',
] as const;

/** The absolute path to the repository root. */
const rootPath = join(import.meta.dirname, '../../');

/** The prefix for all release tags created by this script. */
const tagPrefix = 'vsix-';

/** The path to the `package.json` file for the extension. */
const packageJsonPath = 'vscode-ng-language-service/package.json';

/** The path to the `CHANGELOG.md` file for the extension. */
const changelogPath = 'vscode-ng-language-service/CHANGELOG.md';

/** The remote URL for the angular/angular repository. */
const angularRepoRemote = 'https://github.com/angular/angular.git';

/**
 * The prefix for all release commits created by this script. This is used to filter commits when
 * determining the last release.
 */
const releaseCommitPrefix = 'release: bump VSCode extension version to ';
/** The path to the packaged VSCode extension file. */
const extensionPath = join(rootPath, 'dist/bin/vscode-ng-language-service/ng-template.vsix');

/**
 * Orchestrates the release process of the VSCode extension.
 *
 * This function ensures that the user has a clean working directory, determines the new version
 * number, creates a release branch, generates the changelog, builds the extension, and prepares a
 * pull request for the release.
 */
async function main(): Promise<void> {
  process.chdir(rootPath);

  // Ensure the user has a clean working directory before starting the release process.
  await checkCleanWorkingDirectory();

  let branchToReleaseFrom: string | undefined = process.env['BRANCH_TO_RELEASE'];
  if (!branchToReleaseFrom) {
    const {stdout: currentBranch} = await exec(`git rev-parse --abbrev-ref HEAD`);
    branchToReleaseFrom = currentBranch.trim();
  }

  if (branchToReleaseFrom !== 'main' && !/^\d+\.\d+\.x$/.test(branchToReleaseFrom)) {
    throw new Error(`Cannot release from non releasable branch ${branchToReleaseFrom}.`);
  }

  console.log(chalk.blue(`Releasing from ${branchToReleaseFrom}.`));
  await exec(`git fetch ${angularRepoRemote} ${branchToReleaseFrom}`);

  const currentVersion = await getCurrentVersion();
  const newVersion = await getNewVersion(currentVersion);
  const releaseBranch = await createReleaseBranch(newVersion);
  await generateChangelog(currentVersion, newVersion);
  await updatingPackageJsonVersion(newVersion);

  await installDependencies();
  await buildExtension();

  await prepareReleasePullRequest(newVersion, releaseBranch);
  await waitForPRToBeMergedAndTag(newVersion, branchToReleaseFrom);

  await publishExtension();

  console.log(chalk.green('VSCode extension release process complete!'));
}

/**
 * Creates a new release branch for the given version.
 *
 * The branch will be named `vscode-release-<newVersion>`.
 *
 * @param newVersion The version number for which to create a release branch.
 * @returns A promise that resolves to the name of the newly created branch.
 */
async function createReleaseBranch(newVersion: string): Promise<string> {
  console.log(chalk.blue('Creating release branch...'));
  console.log('');
  const releaseBranch = `vscode-release-${newVersion}`;
  await exec(`git branch -D ${releaseBranch}`).catch(() => {});
  await exec(`git checkout -b ${releaseBranch} FETCH_HEAD`);
  return releaseBranch;
}

/**
 * Checks that the working directory is clean.
 *
 * If the working directory is not clean, an error is thrown.
 */
async function checkCleanWorkingDirectory(): Promise<void> {
  const {stdout: status} = await exec('git status --porcelain');
  if (status.length > 0) {
    throw new Error('Your working directory is not clean. There are uncommitted changes.');
  }
}

/**
 * Gets the SHA of the last release commit.
 *
 * This is used to determine which commits to include in the changelog.
 *
 * @param version The version to look for in the release commit message. If empty, it finds the most recent release commit.
 * @returns A promise that resolves to the SHA of the last release commit.
 */
async function getLastReleaseSha(version = ''): Promise<string> {
  const commitMessagePattern = releaseCommitPrefix + version;
  let {stdout: sha} = await exec(
    `git log FETCH_HEAD --grep="${commitMessagePattern}" --format=format:%H -n 1`,
  );

  sha = sha.trim();
  if (!sha) {
    throw new Error(`Could not find commit that matches pattern: "${commitMessagePattern}"`);
  }

  return sha;
}

/**
 * Prompts the user for the new version number.
 *
 * The current version is read from the `package.json` file and a patch release is suggested. The
 * user is then prompted to enter the new version number. The input is validated to ensure that it
 * is a valid semantic version and that it is greater than the current version.
 *
 * @param currentVersion The current extension version.
 *
 * @returns A promise that resolves to the new version string.
 */
async function getNewVersion(currentVersion: string): Promise<string> {
  const suggestedVersion = semver.inc(currentVersion, 'patch') ?? currentVersion;

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
 * Reads the current version from the `package.json` file.
 * @returns A promise that resolves to the current version string.
 */
async function getCurrentVersion(): Promise<string> {
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  return manifest.version;
}

/**
 * Creates the release commit and pushes the release branch to the user's fork.
 * This function stages the `package.json` and `CHANGELOG.md` files, creates a commit with a
 * standardized release message, and pushes the release branch to the `origin` remote. It then
 * provides a URL to create a pull request.
 *
 * @param newVersion The new version number to include in the commit message.
 * @param releaseBranch The name of the release branch to push.
 */
async function prepareReleasePullRequest(newVersion: string, releaseBranch: string): Promise<void> {
  await exec(
    `git commit -m "${releaseCommitPrefix}${newVersion}" "${packageJsonPath}" "${changelogPath}"`,
  );
  await exec(`git push origin ${releaseBranch} --force-with-lease`);
  const {stdout: remoteUrl} = await exec('git remote get-url origin');
  const match = remoteUrl.trim().match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  const originUser = match ? match[1] : 'angular';
  const originRepo = match ? match[2] : 'angular';

  console.log(
    chalk.yellow(
      `Please create a pull request by visiting: https://github.com/${originUser}/${originRepo}/pull/new/${releaseBranch}`,
    ),
  );
}

/**
 * Generates the changelog for the new version.
 *
 * This function gets all commits between the last release and the current `HEAD`, filters them
 * to include only those that are relevant for the changelog, and then prepends them to the
 * `CHANGELOG.md` file.
 *
 * @param fromVersion The version to generate the changelog from.
 * @param toVersion The version to generate the changelog for.
 */
async function generateChangelog(fromVersion: string, toVersion: string): Promise<void> {
  let {stdout: commits} = await exec(
    `git log --left-only FETCH_HEAD...${tagPrefix}${fromVersion} -E ` +
      '--grep="^(feat|fix|perf)\\((vscode-extension|language-server|language-service)\\):" ' +
      '--format="format:- %s (%h)[https://github.com/angular/angular/commit/%H]"',
  );

  commits = commits.trim();

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const newChangelogEntry = `## ${toVersion} (${date})\n\n${commits}\n\n`;

  const changelogContents = await readFile(changelogPath, 'utf-8');
  await writeFile(changelogPath, newChangelogEntry + changelogContents);

  console.log(chalk.yellow(`Please review the changes the changelog here: ${changelogPath}`));

  await input({
    message: 'Please press Enter to proceed.',
  });

  await exec(`pnpm ng-dev format "${changelogPath}"`);
}

/**
 * Updates the `version` in the `package.json` file.
 *
 * @param newVersion The new version number to set in `package.json`.
 */
async function updatingPackageJsonVersion(newVersion: string): Promise<void> {
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  manifest.version = newVersion;
  await writeFile(packageJsonPath, JSON.stringify(manifest, undefined, 2));
}

/**

 * Waits for the release PR to be merged and then tags the merged commit.
 *
 * This function prompts the user to confirm that the release PR has been merged. Once confirmed,
 * it fetches the latest changes from the upstream repository, finds the SHA of the merged release
 * commit, and then creates a Git tag with the format `vsix-<newVersion>` on that commit. Finally,
 * it pushes the new tag to the origin.
 *
 * @param newVersion The new version number used to create the Git tag.
 * @param branchToReleaseFrom The branch that the release PR was merged into.
 */
async function waitForPRToBeMergedAndTag(
  newVersion: string,
  branchToReleaseFrom: string,
): Promise<void> {
  console.log(
    chalk.yellow(`
=======================
 ⚠️  ACTION REQUIRED ⚠️
=======================

Before merging the PR, you should install the extension at: ${extensionPath} and test it.

Once you press Enter, the process will tag and publish automatically.
`),
  );

  await input({
    message: 'Press Enter once the release PR has been merged.',
  });

  await exec(`git fetch ${angularRepoRemote} ${branchToReleaseFrom}`);
  const mergedCommitSha = await getLastReleaseSha(newVersion);

  console.log(chalk.green(`Tagging the commit: ${mergedCommitSha}`));
  const tagName = `${tagPrefix}${newVersion}`;
  await exec(`git tag ${tagName} ${mergedCommitSha}`);
  await exec(`git push ${angularRepoRemote} tag ${tagName}`);
  console.log(chalk.green('Release tag pushed to origin.'));
}

/**
 * Installs the project's dependencies.
 *
 * This function executes `pnpm install --frozen-lockfile` to ensure that all necessary
 * dependencies are installed before building the extension.
 */
async function installDependencies(): Promise<void> {
  console.log('');
  console.log(chalk.blue(`Installing dependencies...`));
  await execAndStream('pnpm', ['install', '--frozen-lockfile']);
  console.log(chalk.green('Successfully installed dependencies.'));
}

/**
 * Builds the VSCode extension.
 *
 * This function first cleans the Bazel output and then executes the `pnpm --filter=ng-template run
 * package` command with additional Bazel release arguments to build and package the VSCode
 * extension.
 */
async function buildExtension(): Promise<void> {
  console.log('');
  console.log(chalk.blue('Building VSCode extension...'));
  await execAndStream('pnpm', ['bazel', 'clean']);
  await execAndStream('pnpm', [
    'pnpm --filter=ng-template run package',
    ...additionBazelReleaseArgs,
  ]);

  console.log(chalk.green(`VSCode extension packaged at ${extensionPath}`));
}

/**
 * Provides instructions for manually publishing the VSCode extension.
 *
 * This function is a placeholder for future automation. Currently, it guides the user through the
 * manual steps of publishing the extension to the marketplace, including logging in with `vsce`
 * and executing the publish command.
 */
async function publishExtension(): Promise<void> {
  console.log(chalk.yellow('Publishing the extension to the market place.'));
  console.log(`VSIX path: ${extensionPath}`);
  console.log(`Please get a PAT token from: http://go/secret-tunnel/1575675884599726`);

  // NOTE: `vsce publish` will prompt for login if the user is not already authenticated.

  console.log('');
  console.log(chalk.blue('Publishing extension'));
  await execAndStream('pnpm', [
    '--filter="ng-template"',
    'vsce',
    'publish',
    `--packagePath="${extensionPath}"`,
  ]);
}

/**
 * Executes a command and streams its stdout and stderr.
 *
 * This function spawns a child process to execute the given command with the provided arguments.
 * The stdout and stderr of the child process are inherited by the current process, allowing for
 * real-time output. The function returns a promise that resolves when the command exits with a
 * zero exit code, and rejects otherwise.
 *
 * @param command The command to execute.
 * @param args The arguments to pass to the command.
 * @param options The options to pass to `spawn`.
 * @returns A promise that resolves when the command has finished successfully.
 */
function execAndStream(command: string, args: string[], options: SpawnOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(`${command} ${args.join(' ')}`, [], {
      ...options,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

// Start the release process.
main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
