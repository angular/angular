#!/bin/env node
'use strict';

const {cd, cp, exec: _exec, set} = require('shelljs');

// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
set('-e');


// Exports
module.exports = {
  computeDeploymentInfo,
  computeInputVars,
  getLatestCommit,
};

// Run
if (require.main === module) {
  const inputVars = computeInputVars(process.env);
  const deploymentInfo = computeDeploymentInfo(inputVars);

  if (deploymentInfo.skipped) {
    console.log(deploymentInfo.reason);
  } else {
    deploy({...inputVars, ...deploymentInfo});
  }
}

// Helpers
function computeDeploymentInfo(
    {currentBranch, currentCommit, isPullRequest, repoName, repoOwner, stableBranch}) {
  // Do not deploy if we are running in a fork.
  if (`${repoOwner}/${repoName}` !== 'angular/angular') {
    return skipDeployment('Skipping deploy because this is not angular/angular.');
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
      projectId: 'next-angular-io',
      deployedUrl: 'https://next.angular.io/',
    },
    rc: {
      deployEnv: 'rc',
      projectId: 'rc-angular-io',
      deployedUrl: 'https://rc.angular.io/',
    },
    stable: {
      deployEnv: 'stable',
      projectId: `v${currentBranchMajorVersion}-angular-io`,
      deployedUrl: 'https://angular.io/',
    },
    archive: {
      deployEnv: 'archive',
      projectId: `v${currentBranchMajorVersion}-angular-io`,
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
        // This is the latest minor version for a major that is equal or greater than the stable major
        // version, but not the stable version itself:
        // Deploy as `rc`.
        deploymentInfoPerTarget.rc;
  }

  // We should never get here.
  throw new Error('Failed to determine deployment info.');
}

function computeMajorVersion(branchName) {
  return +branchName.split('.', 1)[0];
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

function deploy(
    {currentBranch, currentCommit, deployedUrl, deployEnv, firebaseToken, minPwaScore, projectId}) {
  console.log(
      `Git branch        : ${currentBranch}\n` +
      `Build/deploy mode : ${deployEnv}\n` +
      `Firebase project  : ${projectId}\n` +
      `Deployment URL    : ${deployedUrl}\n`);

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
  yarn(`firebase use "${projectId}" --token "${firebaseToken}"`);
  yarn(
      `firebase deploy --message "Commit: ${currentCommit}" --non-interactive --token ` +
      `"${firebaseToken}"`);

  // Run PWA-score tests.
  yarn(`test-pwa-score "${deployedUrl}" "${minPwaScore}"`);
}

function exec(cmd, opts) {
  return _exec(cmd, {silent: true, ...opts}).trim();
}

function getRemoteRefs(refOrPattern, remote = 'origin') {
  return exec(`git ls-remote ${remote} ${refOrPattern}`).split('\n');
}

function getLatestCommit(branchName, remote = 'origin') {
  return getRemoteRefs(branchName, remote)[0].slice(0, 40);
}

function skipDeployment(reason) {
  return {reason, skipped: true};
}

function yarn(cmd) {
  return exec(`yarn ${cmd}`);
}
