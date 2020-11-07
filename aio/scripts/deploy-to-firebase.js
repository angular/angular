#!/bin/env node
//
// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
//
'use strict';

const {cd, cp, exec, set} = require('shelljs');

set('-e');


// Constants
const REPO_SLUG = 'angular/angular';
const NG_REMOTE_URL = `https://github.com/${REPO_SLUG}.git`;

// Exports
module.exports = {
  computeDeploymentInfo,
  computeInputVars,
  getLatestCommit,
};

// Run
if (require.main === module) {
  const isDryRun = process.argv[2] === '--dry-run';
  const inputVars = computeInputVars(process.env);
  const deploymentInfo = computeDeploymentInfo(inputVars);

  if (deploymentInfo.skipped) {
    console.log(deploymentInfo.reason);
  } else {
    console.log(
        `Git branch        : ${inputVars.currentBranch}\n` +
        `Git commit        : ${inputVars.currentCommit}\n` +
        `Build/deploy mode : ${deploymentInfo.deployEnv}\n` +
        `Firebase project  : ${deploymentInfo.projectId}\n` +
        `Firebase site     : ${deploymentInfo.siteId}\n` +
        `Deployment URLs   : ${deploymentInfo.deployedUrl}\n` +
        `                    https://${deploymentInfo.siteId}.web.app/`);

    if (!isDryRun) {
      deploy({...inputVars, ...deploymentInfo});
    }
  }
}

// Helpers
function computeDeploymentInfo(
    {currentBranch, currentCommit, isPullRequest, repoName, repoOwner, stableBranch}) {
  // Do not deploy if we are running in a fork.
  if (`${repoOwner}/${repoName}` !== REPO_SLUG) {
    return skipDeployment(`Skipping deploy because this is not ${REPO_SLUG}.`);
  }

  // Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
  if (isPullRequest) {
    return skipDeployment('Skipping deploy because this is a PR build.');
  }

  // Do not deploy if the current commit is not the latest on its branch.
  const latestCommit = getLatestCommit(currentBranch);
  if (currentCommit !== latestCommit) {
    return skipDeployment(
        `Skipping deploy because ${currentCommit} is not the latest commit (${latestCommit}).`);
  }

  // The deployment mode is computed based on the branch we are building.
  const currentBranchMajorVersion = computeMajorVersion(currentBranch);
  const deploymentInfoPerTarget = {
    next: {
      deployEnv: 'next',
      projectId: 'angular-io',
      siteId: 'next-angular-io-site',
      deployedUrl: 'https://next.angular.io/',
    },
    rc: {
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
    },
    stable: {
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: 'https://angular.io/',
    },
    archive: {
      deployEnv: 'archive',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
    },
  };

  if (currentBranch === 'master') {
    return deploymentInfoPerTarget.next;
  } else if (currentBranch === stableBranch) {
    return deploymentInfoPerTarget.stable;
  } else {
    const stableBranchMajorVersion = computeMajorVersion(stableBranch);

    // Find the branch that has highest minor version for the given `currentBranchMajorVersion`.
    const mostRecentMinorVersionBranch =
      // List the branches that start with the major version.
      getRemoteRefs(`refs/heads/${currentBranchMajorVersion}.*.x`)
          // Extract the version number.
          .map(line => line.split('/')[2])
          // Sort by the minor version.
          .sort((a, b) => a.split('.')[1] - b.split('.')[1])
          // Get the highest version.
          .pop();

    // Do not deploy if it is not the latest branch for the given major version.
    // NOTE: At this point, we know the current branch is not the stable branch.
    if (currentBranch !== mostRecentMinorVersionBranch) {
      return skipDeployment(
          `Skipping deploy of branch "${currentBranch}" to Firebase.\n` +
          'There is a more recent branch with the same major version: ' +
          `"${mostRecentMinorVersionBranch}"`);
    }

    return (currentBranchMajorVersion < stableBranchMajorVersion) ?
        // This is the latest minor version for a major that is less than the stable major version:
        // Deploy as `archive`.
        deploymentInfoPerTarget.archive :
        // This is the latest minor version for a major that is equal or greater than the stable
        // major version, but not the stable version itself:
        // Deploy as `rc`.
        deploymentInfoPerTarget.rc;
  }

  // We should never get here.
  throw new Error('Failed to determine deployment info.');
}

function computeInputVars({
  CI_AIO_MIN_PWA_SCORE: minPwaScore,
  CI_BRANCH: currentBranch,
  CI_COMMIT: currentCommit,
  CI_PULL_REQUEST,
  CI_REPO_NAME: repoName,
  CI_REPO_OWNER: repoOwner,
  CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: firebaseToken,
  CI_STABLE_BRANCH: stableBranch,
}) {
  return {
    currentBranch,
    currentCommit,
    firebaseToken,
    isPullRequest: CI_PULL_REQUEST !== 'false',
    minPwaScore,
    repoName,
    repoOwner,
    stableBranch,
  };
}

function computeMajorVersion(branchName) {
  return +branchName.split('.', 1)[0];
}

function deploy(
    {currentCommit, deployedUrl, deployEnv, firebaseToken, minPwaScore, projectId, siteId}) {
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
  yarn(`firebase use "${projectId}" --token "${firebaseToken}"`);
  yarn(`firebase target:apply hosting aio "${siteId}" --token "${firebaseToken}"`);
  yarn(
      `firebase deploy --only hosting:aio --message "Commit: ${currentCommit}" --non-interactive ` +
      `--token "${firebaseToken}"`);

  console.log('\n\n\n==== Run PWA-score tests. ====\n');
  yarn(`test-pwa-score "${deployedUrl}" "${minPwaScore}"`);
}

function getRemoteRefs(refOrPattern, remote = NG_REMOTE_URL) {
  return exec(`git ls-remote ${remote} ${refOrPattern}`, {silent: true}).trim().split('\n');
}

function getLatestCommit(branchName, remote = undefined) {
  return getRemoteRefs(branchName, remote)[0].slice(0, 40);
}

function skipDeployment(reason) {
  return {reason, skipped: true};
}

function yarn(cmd) {
  // Using `--silent` to ensure no secret env variables are printed.
  //
  // NOTE:
  // This is not strictly necessary, since CircleCI will mask secret environment variables in the
  // output (see https://circleci.com/docs/2.0/env-vars/#secrets-masking), but is an extra
  // precaution.
  return exec(`yarn --silent ${cmd}`);
}
