#!/bin/env node
//
// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
//
'use strict';

const {cd, cp, exec, mv, sed, set} = require('shelljs');

set('-e');


// Constants
const REPO_SLUG = 'angular/angular';
const NG_REMOTE_URL = `https://github.com/${REPO_SLUG}.git`;
const GIT_REMOTE_REFS_CACHE = new Map();

// Exports
module.exports = {
  computeDeploymentsInfo,
  computeInputVars,
  computeMajorVersion,
  getLatestCommit,
  getMostRecentMinorBranch,
};

// Run
if (require.main === module) {
  const isDryRun = process.argv[2] === '--dry-run';
  const inputVars = computeInputVars(process.env);
  const deploymentsInfo = computeDeploymentsInfo(inputVars);
  const totalDeployments = deploymentsInfo.length;

  console.log(`Total deployments: ${totalDeployments}`);

  deploymentsInfo.forEach((deploymentInfo, idx) => {
    console.log(
        `\n\n\nDeployment ${idx + 1} of ${totalDeployments}\n` +
        '-----------------');

    if (deploymentInfo.skipped) {
      console.log(deploymentInfo.reason);
    } else {
      console.log(
          `Git branch          : ${inputVars.currentBranch}\n` +
          `Git commit          : ${inputVars.currentCommit}\n` +
          `Build/deploy mode   : ${deploymentInfo.deployEnv}\n` +
          `Firebase project    : ${deploymentInfo.projectId}\n` +
          `Firebase site       : ${deploymentInfo.siteId}\n` +
          `Pre-deploy actions  : ${serializeActions(deploymentInfo.preDeployActions)}\n` +
          `Post-deploy actions : ${serializeActions(deploymentInfo.postDeployActions)}\n` +
          `Deployment URLs     : ${deploymentInfo.deployedUrl}\n` +
          `                      https://${deploymentInfo.siteId}.web.app/`);

      if (!isDryRun) {
        deploy({...inputVars, ...deploymentInfo});
      }
    }
  });
}

// Helpers
function build({deployedUrl, deployEnv}) {
  console.log('\n\n\n==== Build the AIO app. ====\n');
  yarn(`build --configuration=${deployEnv} --progress=false`);

  console.log('\n\n\n==== Add any mode-specific files into the AIO distribution. ====\n');
  cp('-rf', `src/extra-files/${deployEnv}/.`, 'dist/');

  console.log('\n\n\n==== Update opensearch descriptor for AIO with `deployedUrl`. ====\n');
  yarn(`set-opensearch-url ${deployedUrl.replace(/[^/]$/, '$&/')}`);  // The URL must end with `/`.
}

function checkPayloadSize() {
  console.log('\n\n\n==== Check payload size and upload the numbers to Firebase DB. ====\n');
  yarn('payload-size');
}

function computeDeploymentsInfo(
    {currentBranch, currentCommit, isPullRequest, repoName, repoOwner, stableBranch}) {
  // Do not deploy if we are running in a fork.
  if (`${repoOwner}/${repoName}` !== REPO_SLUG) {
    return [skipDeployment(`Skipping deploy because this is not ${REPO_SLUG}.`)];
  }

  // Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
  if (isPullRequest) {
    return [skipDeployment('Skipping deploy because this is a PR build.')];
  }

  // Do not deploy if the current commit is not the latest on its branch.
  const latestCommit = getLatestCommit(currentBranch);
  if (currentCommit !== latestCommit) {
    return [
      skipDeployment(
          `Skipping deploy because ${currentCommit} is not the latest commit (${latestCommit}).`),
    ];
  }

  // The deployment mode is computed based on the branch we are building.
  const currentBranchMajorVersion = computeMajorVersion(currentBranch);
  const deploymentInfoPerTarget = {
    next: {
      deployEnv: 'next',
      projectId: 'angular-io',
      siteId: 'next-angular-io-site',
      deployedUrl: 'https://next.angular.io/',
      preDeployActions: [build, checkPayloadSize],
      postDeployActions: [testPwaScore],
    },
    rc: {
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
      preDeployActions: [build, checkPayloadSize],
      postDeployActions: [testPwaScore],
    },
    stable: {
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: 'https://angular.io/',
      preDeployActions: [build, checkPayloadSize],
      postDeployActions: [testPwaScore],
    },
    // Config for deploying the stable build to the RC Firebase site when there is no active RC.
    // See https://github.com/angular/angular/issues/39760 for more info on the purpose of this
    // special deployment.
    noActiveRc: {
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
      preDeployActions: [removeServiceWorker, redirectToAngularIo],
      postDeployActions: [testNoActiveRcDeployment],
    },
    archive: {
      deployEnv: 'archive',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
      preDeployActions: [build, checkPayloadSize],
      postDeployActions: [testPwaScore],
    },
  };

  // If the current branch is `master`, deploy as `next`.
  if (currentBranch === 'master') {
    return [deploymentInfoPerTarget.next];
  }

  // Determine if there is an active RC version by checking whether the most recent minor branch is
  // the stable branch or not.
  const mostRecentMinorBranch = getMostRecentMinorBranch();
  const rcBranch = (mostRecentMinorBranch !== stableBranch) ? mostRecentMinorBranch : null;

  // If the current branch is the RC branch, deploy as `rc`.
  if (currentBranch === rcBranch) {
    return [deploymentInfoPerTarget.rc];
  }

  // If the current branch is the stable branch, deploy as `stable`.
  if (currentBranch === stableBranch) {
    return (rcBranch !== null) ?
      // There is an active RC version. Only deploy to the `stable` project/site.
      [deploymentInfoPerTarget.stable] :
      // There is no active RC version. In addition to deploying to the `stable` project/site,
      // deploy to `rc` to ensure it redirects to `stable`.
      // See https://github.com/angular/angular/issues/39760 for more info on the purpose of this
      // special deployment.
      [
        deploymentInfoPerTarget.stable,
        deploymentInfoPerTarget.noActiveRc,
      ];
  }

  // If we get here, it means that the current branch is neither `master`, nor the RC or stable
  // branches. At this point, we may only deploy as `archive` and only if the following criteria are
  // met:
  //   1. The current branch must have the highest minor version among all branches with the same
  //      major version.
  //   2. The current branch must have a major version that is lower than the stable major version.

  // Do not deploy if it is not the branch with the highest minor for the given major version.
  const mostRecentMinorBranchForMajor = getMostRecentMinorBranch(currentBranchMajorVersion);
  if (currentBranch !== mostRecentMinorBranchForMajor) {
    return [
      skipDeployment(
          `Skipping deploy of branch "${currentBranch}" to Firebase.\n` +
          'There is a more recent branch with the same major version: ' +
          `"${mostRecentMinorBranchForMajor}"`),
    ];
  }

  // Do not deploy if it does not have a lower major version than stable.
  const stableBranchMajorVersion = computeMajorVersion(stableBranch);
  if (currentBranchMajorVersion >= stableBranchMajorVersion) {
    return [
      skipDeployment(
          `Skipping deploy of branch "${currentBranch}" to Firebase.\n` +
          'This branch has an equal or higher major version than the stable branch ' +
          `("${stableBranch}") and is not the most recent minor branch.`),
    ];
  }

  // This is the highest minor version for a major that is lower than the stable major version:
  // Deploy as `archive`.
  return [deploymentInfoPerTarget.archive];
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

function deploy(data) {
  const {
    currentCommit,
    firebaseToken,
    postDeployActions,
    preDeployActions,
    projectId,
    siteId,
  } = data;

  cd(`${__dirname}/..`);

  console.log('\n\n\n==== Run pre-deploy actions. ====\n');
  preDeployActions.forEach(fn => fn(data));

  console.log('\n\n\n==== Deploy AIO to Firebase hosting. ====\n');
  const firebase = cmd => yarn(`firebase ${cmd} --token "${firebaseToken}"`);
  firebase(`use "${projectId}"`);
  firebase('target:clear hosting aio');
  firebase(`target:apply hosting aio "${siteId}"`);
  firebase(`deploy --only hosting:aio --message "Commit: ${currentCommit}" --non-interactive`);

  console.log('\n\n\n==== Run post-deploy actions. ====\n');
  postDeployActions.forEach(fn => fn(data));
}

function getRemoteRefs(refOrPattern, {remote = NG_REMOTE_URL, retrieveFromCache = true} = {}) {
  // If remote refs for the same `refOrPattern` and `remote` have been requested before, return the
  // cached results. This improves the performance and ensures a more stable behavior.
  //
  // NOTE:
  // This shouldn't make any difference during normal execution (since there are no duplicate
  // requests atm), but makes the tests more stable (for example, avoiding errors caused by pushing
  // a new commit on a branch while the tests execute, which would cause `getLatestCommit()` to
  // return a different value).
  const cmd = `git ls-remote ${remote} ${refOrPattern}`;
  const result = (retrieveFromCache && GIT_REMOTE_REFS_CACHE.has(cmd))
      ? GIT_REMOTE_REFS_CACHE.get(cmd)
      : exec(cmd, {silent: true}).trim().split('\n');

  // Cache the result for future use (regardless of the value of `retrieveFromCache`).
  GIT_REMOTE_REFS_CACHE.set(cmd, result);

  return result;
}

function getMostRecentMinorBranch(major = '*', options = undefined) {
  // List the branches that start with the given major version (or any major if none given).
  return getRemoteRefs(`refs/heads/${major}.*.x`, options)
      // Extract the branch name.
      .map(line => line.split('/')[2])
      // Filter out branches that are not of the format `<number>.<number>.x`.
      .filter(name => /^\d+\.\d+\.x$/.test(name))
      // Sort by version.
      .sort((a, b) => {
        const [majorA, minorA] = a.split('.');
        const [majorB, minorB] = b.split('.');
        return (majorA - majorB) || (minorA - minorB);
      })
      // Get the branch corresponding to the highest version.
      .pop();
}

function getLatestCommit(branchName, options = undefined) {
  return getRemoteRefs(branchName, options)[0].slice(0, 40);
}

function redirectToAngularIo() {
  // Update the Firebase hosting configuration redirect all non-file requests (i.e. requests that do
  // not contain a dot in their last path segment) to `angular.io`.
  // See https://firebase.google.com/docs/hosting/full-config#redirects.
  const redirectRule =
      '{"type": 302, "regex": "^(.*/[^./]*)$", "destination": "https://angular.io:1"}';
  sed('-i', /(\s*)"redirects": \[/, `$&\n$1  ${redirectRule},\n`, 'firebase.json');
}

function removeServiceWorker() {
  // Rename the SW manifest (`ngsw.json`). This will cause the ServiceWorker to unregister itself.
  // See https://angular.io/guide/service-worker-devops#fail-safe.
  mv('dist/ngsw.json', 'dist/ngsw.json.bak');
}

function serializeActions(actions) {
  return actions.map(fn => fn.name).join(', ');
}

function skipDeployment(reason) {
  return {reason, skipped: true};
}

function testNoActiveRcDeployment({deployedUrl}) {
  const deployedOrigin = deployedUrl.replace(/\/$/, '');

  // Ensure a request for `ngsw.json` returns 404.
  const ngswJsonUrl = `${deployedOrigin}/ngsw.json`;
  const ngswJsonScript = `https.get('${ngswJsonUrl}', res => console.log(res.statusCode))`;
  const ngswJsonActualStatusCode = exec(`node --eval "${ngswJsonScript}"`, {silent: true}).trim();
  const ngswJsonExpectedStatusCode = '404';

  if (ngswJsonActualStatusCode !== ngswJsonExpectedStatusCode) {
    throw new Error(
        `Expected '${ngswJsonUrl}' to return a status code of '${ngswJsonExpectedStatusCode}', ` +
        `but it returned '${ngswJsonActualStatusCode}'.`);
  }

  // Ensure a request for `foo/bar` is redirected to `https://angular.io/foo/bar`.
  const fooBarUrl = `${deployedOrigin}/foo/bar?baz=qux`;
  const fooBarScript =
      `https.get('${fooBarUrl}', res => console.log(res.statusCode, res.headers.location))`;
  const [fooBarActualStatusCode, fooBarActualRedirectUrl] =
      exec(`node --eval "${fooBarScript}"`, {silent: true}).trim().split(' ');
  const fooBarExpectedStatusCode = '302';
  const fooBarExpectedRedirectUrl = 'https://angular.io/foo/bar?baz=qux';

  if (fooBarActualStatusCode !== fooBarExpectedStatusCode) {
    throw new Error(
        `Expected '${fooBarUrl}' to return a status code of '${fooBarExpectedStatusCode}', but ` +
        `it returned '${fooBarActualStatusCode}'.`);
  } else if (fooBarActualRedirectUrl !== fooBarExpectedRedirectUrl) {
    throw new Error(
        `Expected '${fooBarUrl}' to be redirected to '${fooBarExpectedRedirectUrl}', but it was ` +
        `but it was redirected to '${fooBarActualRedirectUrl}'.`);
  }
}

function testPwaScore({deployedUrl, minPwaScore}) {
  console.log('\n\n\n==== Run PWA-score tests. ====\n');
  yarn(`test-pwa-score "${deployedUrl}" "${minPwaScore}"`);
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
