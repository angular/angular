#!/bin/env node
'use strict';

const {cd, cp, exec: _exec, set} = require('shelljs');

// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
set('-e');


// Arguments and environment variables
const args = process.argv.slice(2);
const dryRun = args[0] === '--dry-run';

const {
  CI_AIO_MIN_PWA_SCORE,
  CI_BRANCH,
  CI_COMMIT,
  CI_PULL_REQUEST,
  CI_REPO_NAME,
  CI_REPO_OWNER,
  CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN,
  CI_STABLE_BRANCH,
} = process.env;

// Do not deploy if we are running in a fork.
if (`${CI_REPO_OWNER}/${CI_REPO_NAME}` !== 'angular/angular') {
  console.log('Skipping deploy because this is not angular/angular.');
  process.exit(0);
}

// Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
if (CI_PULL_REQUEST !== 'false') {
  console.log('Skipping deploy because this is a PR build.');
  process.exit(0);
}

// Do not deploy if the current commit is not the latest on its branch.
const latestCommit = exec(`git ls-remote origin ${CI_BRANCH}`).slice(0, 40);
if ( CI_COMMIT !== latestCommit) {
  console.log(`Skipping deploy because ${CI_COMMIT} is not the latest commit (${latestCommit}).`);
  process.exit(0);
}

// The deployment mode is computed based on the branch we are building.
const currentBranchMajorVersion = computeMajorVersion(CI_BRANCH);
const deployInfoPerTarget = {
  next: {
    deployEnv: 'next',
    projectId: 'aio-staging',
    deployedUrl: 'https://next.angular.io/',
  },
  stable: {
    deployEnv: 'stable',
    projectId: 'angular-io',
    deployedUrl: 'https://angular.io/',
  },
  archive: {
    deployEnv: 'archive',
    projectId: `v${currentBranchMajorVersion}-angular-io`,
    deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
  },
};
let deployInfo = null;

if (CI_BRANCH === 'master') {
  deployInfo = deployInfoPerTarget.next;
} else if (CI_BRANCH === CI_STABLE_BRANCH) {
  deployInfo = deployInfoPerTarget.stable;
} else {
  const stableBranchMajorVersion = computeMajorVersion(CI_STABLE_BRANCH);

  // Do not deploy if the major version is not less than the stable branch major version.
  if (currentBranchMajorVersion >= stableBranchMajorVersion) {
    console.log(
        `Skipping deploy of branch "${CI_BRANCH}" to Firebase.\n` +
        'We only deploy archive branches with the major version less than the stable branch: ' +
        `"${CI_STABLE_BRANCH}"`);
    process.exit(0);
  }

  // Find the branch that has highest minor version for the given `currentBranchMajorVersion`.
  const mostRecentMinorVersion =
    // List the branches that start with the major version.
    exec(`git ls-remote origin refs/heads/${currentBranchMajorVersion}.*.x`).split('\n')
        // Extract the version number.
        .map(line => line.split('/')[2])
        // Sort by the minor version.
        .sort((a, b) => a.split('.')[1] - b.split('.')[1])
        // Get the highest version.
        .pop();

  // Do not deploy as it is not the latest branch for the given major version.
  if (CI_BRANCH !== mostRecentMinorVersion) {
    console.log(
        `Skipping deploy of branch "${CI_BRANCH}" to Firebase.\n` +
        `There is a more recent branch with the same major version: "${mostRecentMinorVersion}"`);
    process.exit(0);
  }

  deployInfo = deployInfoPerTarget.archive;
}

const {deployEnv, projectId, deployedUrl} = deployInfo;
console.log(
    `Git branch        : ${CI_BRANCH}\n` +
    `Build/deploy mode : ${deployEnv}\n` +
    `Firebase project  : ${projectId}\n` +
    `Deployment URL    : ${deployedUrl}\n`);

if (dryRun) {
  process.exit(0);
}

// Deploy
cd(`${__dirname}/..`);

// Build the app.
yarn(`build --configuration=${deployEnv} --progress=false`);

// Include any mode-specific files.
cp('-rf', `src/extra-files/${deployEnv}/.`, 'dist/');

// Set `deployedUrl` as parameter in the opensearch description.
// `deployedUrl` must end with `/`.
yarn(`set-opensearch-url ${deployedUrl}`);

// Check payload size.
yarn('payload-size');

// Deploy to Firebase.
yarn(`firebase use "${projectId}" --token "${CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN}"`);
yarn(
    `firebase deploy --message "Commit: ${CI_COMMIT}" --non-interactive --token ` +
    CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN);

// Run PWA-score tests.
yarn(`test-pwa-score "${deployedUrl}" "${CI_AIO_MIN_PWA_SCORE}"`);


// Helpers
function computeMajorVersion(branchName) {
  return +branchName.split('.', 1)[0];
}

function exec(cmd, opts) {
  return _exec(cmd, {silent: true, ...opts}).trim();
}

function yarn(cmd) {
  return exec(`yarn ${cmd}`);
}
