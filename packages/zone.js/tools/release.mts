/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This script orchestrates the release process for zone.js.
 * It handles versioning, changelog generation, building, and publishing.
 */

// tslint:disable:no-console
import {input, select} from '@inquirer/prompts';
import chalk from 'chalk';
import semver from 'semver';
import {readFile, writeFile} from 'node:fs/promises';
import {exec as nodeExec, spawn, type SpawnOptions} from 'node:child_process';
import {promisify} from 'node:util';
import {join} from 'node:path';

const exec = promisify(nodeExec);

/** The absolute path to the repository root. */
const rootPath = join(import.meta.dirname, '../../..');

/** The path to the `package.json` file for zone.js. */
const packageJsonPath = join(rootPath, 'packages/zone.js/package.json');

/** The path to the `CHANGELOG.md` file for zone.js. */
const changelogPath = join(rootPath, 'packages/zone.js/CHANGELOG.md');

async function main(): Promise<void> {
  // Ensure we are in the root directory
  process.chdir(rootPath);

  const choice = await select({
    message: 'What do you want to do?',
    choices: [
      {name: '1. Create a PR for release', value: 'create-pr'},
      {name: '2. Cut a release (publish) - after PR merge', value: 'cut-release'},
    ],
  });

  if (choice === 'create-pr') {
    await createPrWorkflow();
  } else {
    await cutReleaseWorkflow();
  }
}

/**
 * Workflow for creating a PR for release.
 * 1. Clean node_modules and install.
 * 2. Determine previous tag.
 * 3. Update version in package.json.
 * 4. Generate changelog.
 * 5. Dry run build.
 * 6. Create branch and commit.
 * 7. Push and suggest PR.
 */
async function createPrWorkflow(): Promise<void> {
  // Ensure the user has a clean working directory.
  await checkCleanWorkingDirectory();
  // Ensure there is a github token.
  ensureGithubToken();

  console.log(chalk.blue('Preparing for release PR...'));

  // rm -rf node_modules && pnpm install
  await cleanAndInstall();

  const currentVersion = await getCurrentVersion();
  const previousTag = await getPreviousTag();
  const newVersion = await getNewVersion(currentVersion);
  const tagName = `zone.js-${newVersion}`;

  console.log(
    chalk.blue(`Releasing zone.js version ${tagName}. Previous release was ${previousTag}.`),
  );

  // Update version in package.json
  await updatingPackageJsonVersion(newVersion);

  // Generate changelog
  // pnpm gulp changelog:zonejs
  console.log(chalk.blue('Generating changelog...'));
  await execAndStream('pnpm', ['gulp', 'changelog:zonejs'], {
    env: {
      ...process.env,
      TAG: tagName,
      PREVIOUS_ZONE_TAG: previousTag,
    },
  });

  console.log(chalk.yellow(`Please review the changes in ${changelogPath}`));
  await input({
    message: 'Please press Enter to proceed after reviewing the changelog.',
  });

  // Dry run build
  console.log(chalk.blue('Running dry run build...'));
  await execAndStream('pnpm', [
    'bazel',
    'build',
    '//packages/zone.js:npm_package',
    `--workspace_status_command="echo STABLE_PROJECT_VERSION ${newVersion}"`,
  ]);

  // Create branch
  const releaseBranch = `release_${tagName}-${Date.now()}`;
  console.log(chalk.blue(`Creating branch ${releaseBranch}...`));
  await exec(`git checkout -b "${releaseBranch}"`);

  // Add files
  await exec(`git add packages/zone.js/CHANGELOG.md packages/zone.js/package.json`);
  const commitMessage = `release: cut the ${tagName} release`;
  await exec(`git commit -m "${commitMessage}"`);

  // Push
  const forkRemote = await getForkRemoteName();
  console.log(chalk.blue(`Pushing to ${forkRemote}...`));
  await exec(`git push ${forkRemote} "${releaseBranch}"`);

  console.log(
    chalk.yellow(
      `Please create a pull request by visiting: https://github.com/angular/angular/pull/new/${releaseBranch}`,
    ),
  );

  const continueToPublish = await select({
    message: 'Do you want to continue to the publish step once the PR is merged?',
    choices: [
      {
        name: 'Yes, I will merge the PR and then continue to publish from here.',
        value: true,
      },
      {
        name: 'No, I will run the publish step separately later.',
        value: false,
      },
    ],
  });

  if (continueToPublish) {
    await input({
      message:
        'Please create the pull request, get it merged, and then press Enter to continue to publish.',
    });
    await cutReleaseWorkflow();
  }
}

/**
 * Workflow for cutting a release.
 * 1. Checkout upstream/main.
 * 2. Find SHA of the release commit.
 * 3. Checkout SHA.
 * 4. Build.
 * 5. Publish.
 * 6. Tag and push.
 */
async function cutReleaseWorkflow(): Promise<void> {
  await checkCleanWorkingDirectory();

  console.log(chalk.blue('Fetching upstream...'));
  await exec(`git fetch https://github.com/angular/angular.git main`);
  await exec(`git checkout FETCH_HEAD`);

  await cleanAndInstall();

  const currentVersion = await getCurrentVersion();
  const tagName = `zone.js-${currentVersion}`;

  console.log(chalk.blue(`Looking for release commit for ${tagName}...`));
  const commitMessagePattern = `release: cut the ${tagName} release`;
  const {stdout: sha} = await exec(
    `git log FETCH_HEAD --oneline -n 1000 | grep "${commitMessagePattern}" | cut -f 1 -d " "`,
  );

  const trimmedSha = sha.trim();
  if (!trimmedSha) {
    throw new Error(`Could not find commit with message containing: "${commitMessagePattern}"`);
  }

  console.log(chalk.green(`Found release SHA: ${trimmedSha}`));
  console.log(chalk.blue(`Checking out ${trimmedSha}...`));
  await exec(`git checkout ${trimmedSha}`);

  // Build
  console.log(chalk.blue('Building for release...'));
  await execAndStream('pnpm', [
    'bazel',
    'build',
    '//packages/zone.js:npm_package',
    '--config=release',
    `--workspace_status_command="echo STABLE_PROJECT_VERSION ${currentVersion}"`,
  ]);

  // Publish
  console.log(chalk.yellow('Ready to publish.'));
  await ensureNpmLogin();

  await input({
    message: 'Press Enter to publish to npm.',
  });

  await execAndStream('npm', [
    'publish',
    'dist/bin/packages/zone.js/npm_package',
    '--access',
    'public',
    '--tag',
    'latest',
  ]);

  // Tag
  console.log(chalk.blue(`Tagging ${tagName}...`));
  await exec(`git tag ${tagName} ${trimmedSha}`);

  console.log(chalk.blue(`Pushing tag ${tagName} to upstream...`));
  // Note: pushing to upstream requires permissions.
  await exec(`git push https://github.com/angular/angular.git ${tagName}`);

  console.log(chalk.green('Zone.js release complete!'));
}

async function cleanAndInstall() {
  console.log(chalk.blue('Cleaning and installing dependencies...'));
  await exec('git clean -dxf');
  await execAndStream('pnpm', ['install', , '--frozen-lockfile']);
}

async function checkCleanWorkingDirectory(): Promise<void> {
  const {stdout: status} = await exec('git status --porcelain');
  if (status.length > 0) {
    throw new Error('Your working directory is not clean. There are uncommitted changes.');
  }
}

async function getCurrentVersion(): Promise<string> {
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  return manifest.version;
}

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
  return newVersion;
}

async function getPreviousTag(): Promise<string> {
  const {stdout: tags} = await exec(`git tag --list "zone.js-*"`);
  const versions = tags
    .trim()
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t.startsWith('zone.js-'))
    .map((t) => t.slice('zone.js-'.length))
    .filter((v) => semver.valid(v));

  if (versions.length === 0) {
    throw new Error('No previous release tags found.');
  }

  // Sort versions in descending order
  versions.sort((a, b) => semver.rcompare(a, b));

  return `zone.js-${versions[0]}`;
}

async function updatingPackageJsonVersion(newVersion: string): Promise<void> {
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  manifest.version = newVersion;
  await writeFile(packageJsonPath, JSON.stringify(manifest, undefined, 2) + '\n');
}

async function ensureNpmLogin(): Promise<void> {
  const registry = 'https://wombat-dressing-room.appspot.com';
  try {
    const {stdout: user} = await exec(`npm whoami --registry ${registry}`);
    console.log(chalk.green(`Logged in to ${registry} as ${user.trim()}.`));
  } catch (e) {
    console.log(chalk.yellow(`Not logged in to ${registry}. Logging in now...`));
    await execAndStream('npm', ['login', '--registry', registry]);
  }
}

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

function ensureGithubToken(): string {
  const token = process.env['GITHUB_TOKEN'] ?? process.env['TOKEN'];
  if (!token) {
    console.warn(
      chalk.yellow(
        'GITHUB_TOKEN nor TOKEN environment variable is set. GitHub operations might fail or prompt for credentials.',
      ),
    );
    return '';
  }
  return token;
}

async function getForkRemoteName(): Promise<string> {
  const {stdout} = await exec('git remote -v');
  const remotes = new Map<string, string>();
  for (const line of stdout.split('\n')) {
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const [name, url] = parts;
      remotes.set(name, url);
    }
  }

  const candidates: string[] = [];
  for (const [name, url] of remotes) {
    if (getRepoDetails(url).owner !== 'angular') {
      candidates.push(name);
    }
  }

  if (candidates.includes('origin')) {
    return 'origin';
  }

  if (candidates.length === 0) {
    // If no fork found, might be directly on upstream or just no fork configured.
    // Return origin as fallback.
    return 'origin';
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  return await select({
    message: 'Which remote should be used as your fork?',
    choices: candidates.map((c) => ({value: c})),
  });
}

function getRepoDetails(remoteUrl: string): {owner: string; repo: string} {
  const match = remoteUrl.trim().match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  return {
    owner: match ? match[1] : 'angular',
    repo: match ? match[2] : 'angular',
  };
}

main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
