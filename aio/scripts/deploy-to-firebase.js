#!/bin/env node
//
// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
//
'use strict';

const {cd, cp, exec: _exec, set} = require('shelljs');

set('-e');


// Arguments, environment variables and constants.
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

const REPO_SLUG = 'angular/angular';
const NG_REMOTE_URL = `https://github.com/${REPO_SLUG}.git`;

// Do not deploy if we are running in a fork.
if (`${CI_REPO_OWNER}/${CI_REPO_NAME}` !== REPO_SLUG) {
  console.log(`Skipping deploy because this is not ${REPO_SLUG}.`);
  process.exit(0);
}

// Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
if (CI_PULL_REQUEST !== 'false') {
  console.log('Skipping deploy because this is a PR build.');
  process.exit(0);
}

// Do not deploy if the current commit is not the latest on its branch.
const latestCommit = exec(`git ls-remote ${NG_REMOTE_URL} ${CI_BRANCH}`).slice(0, 40);
if (CI_COMMIT !== latestCommit) {
  console.log(`Skipping deploy because ${CI_COMMIT} is not the latest commit (${latestCommit}).`);
  process.exit(0);
}

// The deployment mode is computed based on the branch we are building.
const currentBranchMajorVersion = computeMajorVersion(CI_BRANCH);
// Special-case v9, because it is piloting the Firebase hosting "multisites" setup.
// See https://angular-team.atlassian.net/browse/DEV-125 for more info.
const isV9 = currentBranchMajorVersion === 9;
const deployInfoPerTarget = {
  next: {
    deployEnv: 'next',
    projectId: 'aio-staging',
    siteId: 'aio-staging',
    deployedUrl: 'https://next.angular.io/',
  },
  stable: {
    deployEnv: 'stable',
    projectId: 'angular-io',
    siteId: 'angular-io',
    deployedUrl: 'https://angular.io/',
  },
  archive: {
    deployEnv: 'archive',
    projectId: isV9 ? 'aio-staging' : `v${currentBranchMajorVersion}-angular-io`,
    siteId: isV9 ? 'v9-angular-io' : `v${currentBranchMajorVersion}-angular-io`,
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
    exec(`git ls-remote ${NG_REMOTE_URL} refs/heads/${currentBranchMajorVersion}.*.x`).split('\n')
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

const {deployEnv, projectId, siteId, deployedUrl} = deployInfo;
console.log(
    `Git branch        : ${CI_BRANCH}\n` +
    `Build/deploy mode : ${deployEnv}\n` +
    `Firebase project  : ${projectId}\n` +
    `Firebase site     : ${siteId}\n` +
    `Deployment URL    : ${deployedUrl}\n`);

if (dryRun) {
  process.exit(0);
}

// Deploy
cd(`${__dirname}/..`);

console.log('\n\n\n==== Build the AIO app. ====\n');
yarn(`build --configuration=${deployEnv} --progress=false`);

console.log('\n\n\n==== Add any mode-specific files into the AIO distribution. ====\n');
cp('-rf', `src/extra-files/${deployEnv}/.`, 'dist/');


console.log('\n\n\n==== Update opensearch descriptor for AIO with `deployedUrl`. ====\n');
yarn(`set-opensearch-url ${deployedUrl.replace(/[^/]$/, '$&/')}`);  // The URL must end with `/`.

console.log('\n\n\n==== Check payload size and upload the numbers to Firebase DB. ====\n');
yarn('payload-size');

console.log('\n\n\n==== Deploy AIO to Firebase hosting. ====\n');
yarn(`firebase use "${projectId}" --token "${CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN}"`);
yarn(
    `firebase target:apply hosting aio "${siteId}" --token ` +
    `"${CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN}"`);
yarn(
    `firebase deploy --only hosting:aio --message "Commit: ${CI_COMMIT}" --non-interactive ` +
    `--token ${CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN}`);

console.log('\n\n\n==== Run PWA-score tests. ====\n');
yarn(`test-pwa-score "${deployedUrl}" "${CI_AIO_MIN_PWA_SCORE}"`);


// Helpers
function computeMajorVersion(branchName) {
  return +branchName.split('.', 1)[0];
}

function exec(cmd, opts) {
  // Using `silent: true` to ensure no secret env variables are printed.
  return _exec(cmd, {silent: true, ...opts}).trim();
}

function yarn(cmd) {
  // Using `--silent` to ensure no secret env variables are printed.
  return exec(`yarn --silent ${cmd}`);
}
