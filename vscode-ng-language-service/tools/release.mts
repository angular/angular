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

/** The marker used to split the changelog between releases. */
const CHANGELOG_RELEASE_MARKER = '<!-- CHANGELOG SPLIT MARKER -->';

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
  await exec(`git fetch ${angularRepoRemote} ${branchToReleaseFrom} --tags`);

  const currentVersion = await getCurrentVersion();
  const newVersion = await getNewVersion(currentVersion);
  const releaseBranch = await createReleaseBranch(newVersion);
  const changelog = await generateChangelog(currentVersion, newVersion);
  await updatingPackageJsonVersion(newVersion);

  await installDependencies();
  await buildExtension();

  await prepareReleasePullRequest(releaseBranch, `${releaseCommitPrefix}${newVersion}`, [
    packageJsonPath,
    changelogPath,
  ]);
  await waitForPRToBeMergedAndTag(newVersion, branchToReleaseFrom);

  await publishExtension();

  await createGithubRelease(newVersion, changelog);

  if (branchToReleaseFrom !== 'main') {
    await cherryPickChangelog(changelog, newVersion);
  }

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
 * Creates a commit and pushes the branch to the user's fork.
 *
 * @param branch The name of the branch to push.
 * @param commitMessage The commit message.
 * @param files The files to commit.
 */
async function prepareReleasePullRequest(
  branch: string,
  commitMessage: string,
  files: string[],
): Promise<void> {
  await exec(`git commit -m "${commitMessage}" "${files.join('" "')}"`);
  await exec(`git push origin ${branch} --force-with-lease`);
  const {stdout: remoteUrl} = await exec('git remote get-url origin');
  const {owner, repo} = getRepoDetails(remoteUrl);

  console.log(
    chalk.yellow(
      `Please create a pull request by visiting: https://github.com/${owner}/${repo}/pull/new/${branch}`,
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
async function generateChangelog(fromVersion: string, toVersion: string): Promise<string> {
  const previousTag = await getPreviousTag(fromVersion);

  // Get all subjects from the previous release to filter out duplicates (cherry-picks).
  const {stdout: existingSubjectsOutput} = await exec(
    `git log ${previousTag} -E ` +
      '--grep="^(feat|fix|perf)\\((vscode-extension|language-server|language-service)\\):" ' +
      '--format="%s"',
  );
  const existingSubjects = new Set(
    existingSubjectsOutput
      .trim()
      .split('\n')
      .map((s) => s.trim()),
  );

  const {stdout: newCommitsRaw} = await exec(
    `git log --left-only FETCH_HEAD...${previousTag} -E ` +
      '--grep="^(feat|fix|perf)\\((vscode-extension|language-server|language-service)\\):" ' +
      '--format="%s|%h|%H"',
  );

  const commits = newCommitsRaw
    .trim()
    .split('\n')
    .filter((line) => {
      if (!line) return false;
      const [subject, shortHash, hash] = line.split('|');
      return !existingSubjects.has(subject.trim());
    })
    .map((line) => {
      const [subject, shortHash, hash] = line.split('|');
      return `- ${subject} ([${shortHash}](https://github.com/angular/angular/commit/${hash}))`;
    })
    .join('\n');

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const newChangelogEntry = `## ${toVersion} (${date})\n\n${commits}`;

  const changelogContents = await readFile(changelogPath, 'utf-8');
  await writeFile(
    changelogPath,
    [newChangelogEntry, CHANGELOG_RELEASE_MARKER, changelogContents].join('\n\n'),
  );

  console.log(chalk.yellow(`Please review the changes the changelog here: ${changelogPath}`));

  await input({
    message: 'Please press Enter to proceed.',
  });

  await exec(`pnpm ng-dev format "${changelogPath}"`);

  // Read the formatted changelog from disk to get the correct content for the release.
  const formattedChangelog = await readFile(changelogPath, 'utf-8');
  return formattedChangelog.split(CHANGELOG_RELEASE_MARKER)[0].trim();
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
  const tagName = getTagName(newVersion);
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
 * Creates a GitHub release and uploads the extension asset.
 *
 * @param version The version of the release.
 * @param changelog The changelog content for the release.
 */
async function createGithubRelease(version: string, changelog: string): Promise<void> {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set. Cannot create GitHub release.');
  }

  console.log(chalk.blue('Creating GitHub release...'));

  const commonHeaders = {
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const {owner, repo} = getRepoDetails(angularRepoRemote);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: getTagName(version),
      name: `VSCode Extension: ${version}`,
      body: changelog
        // Remove the version header from the changelog as it is already in the release title.
        .replace(/## .*? \(\d{4}-\d{2}-\d{2}\)/, '')
        .trim(),
      make_latest: 'false',
      prerelease: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create release: ${response.statusText} ${await response.text()}`);
  }

  const release = (await response.json()) as {upload_url: string};
  const uploadUrl = release.upload_url.replace(
    '{?name,label}',
    `?name=ng-template-${version}.vsix`,
  );
  const vsixContent = await readFile(extensionPath);
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Content-Type': 'application/zip',
      'Content-Length': vsixContent.length.toString(),
    },
    body: vsixContent,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload asset: ${uploadResponse.statusText} ${await uploadResponse.text()}`,
    );
  }

  console.log(chalk.green('GitHub release created and asset uploaded.'));
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
 * Cherry-picks the changelog changes to the main branch.
 *
 * @param changelog The changelog content to add.
 * @param newVersion The new version number.
 */
async function cherryPickChangelog(changelog: string, newVersion: string): Promise<void> {
  console.log(chalk.blue('Cherry-picking changelog to main...'));

  await exec(`git fetch ${angularRepoRemote} main`);
  const cherryPickBranch = `vscode-changelog-cherry-pick${newVersion}`;
  await exec(`git branch -D ${cherryPickBranch}`).catch(() => {});
  await exec(`git checkout -b ${cherryPickBranch} FETCH_HEAD`);

  const changelogContents = await readFile(changelogPath, 'utf-8');
  await writeFile(
    changelogPath,
    [changelog, CHANGELOG_RELEASE_MARKER, changelogContents].join('\n\n'),
  );

  await prepareReleasePullRequest(
    cherryPickBranch,
    `docs: release notes for the vscode extension ${newVersion} release`,
    [changelogPath],
  );
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

/**
 * Gets the owner and repo name from a remote URL.
 *
 * @param remoteUrl The remote URL to parse.
 * @returns An object containing the owner and repo name.
 */
function getRepoDetails(remoteUrl: string): {owner: string; repo: string} {
  const match = remoteUrl.trim().match(/github\.com[/:]([\w-]+)\/([\w-]+)/);

  return {
    owner: match ? match[1] : 'angular',
    repo: match ? match[2] : 'angular',
  };
}

/**
 * Gets the previous tag to version from.
 *
 * It checks if the tag for the `currentVersion` exists. If it does, returning it.
 * If not, it finds the latest tag that adheres to the semver versioning of the extension.
 */
async function getPreviousTag(currentVersion: string): Promise<string> {
  const currentTag = getTagName(currentVersion);
  try {
    await exec(`git rev-parse "${currentTag}"`);
    return currentTag;
  } catch {
    // Tag does not exist.
  }

  const {stdout: tags} = await exec(`git tag --list "${tagPrefix}*"`);
  const versions = tags
    .trim()
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t.startsWith(tagPrefix))
    .map((t) => t.slice(tagPrefix.length))
    .filter((v) => semver.valid(v));

  if (versions.length === 0) {
    throw new Error('No previous release tags found.');
  }

  // Sort versions in descending order
  versions.sort((a, b) => semver.rcompare(a, b));

  return getTagName(versions[0]);
}

/**
 * Gets the tag name for the given version.
 *
 * @param version The version to generate the tag name for.
 * @returns The tag name.
 */
function getTagName(version: string): string {
  return `${tagPrefix}${version}`;
}

// Start the release process.
main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
