#!/bin/env node
//
// WARNING: `CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN` should NOT be printed.
//

/*
 * The following table summarizes the deployment targets per branch and RC phase (i.e. what Firebase
 * project/site each branch is deployed to and with what config/tweaks).
 *
 * For more details on each deployment target, see the `deploymentInfoPerTarget` object inside the
 * `computeDeploymentsInfo()` function.
 * For additional information/terminology, see also:
 *   - [Angular Branching and Versioning: A Practical Guide](../../../docs/BRANCHES.md)
 *   - [Angular Development Phases](https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU)
 *
 * |--------------------|-------------------------------------------------------------------|
 * | TABLE:             |                      Is there an active RC?                       |
 * | Where should we    |---------------------------------|---------------------------------|
 * | deploy to/as?      |               NO                |               YES               |
 * |-----------|--------|---------------------------------|---------------------------------|
 * |           | LTS    | archive                         | archive                         |
 * |           |--------|---------------------------------|---------------------------------|
 * |           | PATCH  | stable                          | stable                          |
 * | What      |        | redirectVersionDomainToStable   | redirectVersionDomainToStable   |
 * | branch    |        | redirectRcToStable              |                                 |
 * | are we    |--------|---------------------------------|---------------------------------|
 * | deploying | RC     | -                               | rc                              |
 * | from?     |        |                                 | redirectVersionDomainToRc(*)    |
 * |           |--------|---------------------------------|---------------------------------|
 * |           | MAIN   | next                            | next                            |
 * |           |        | redirectVersionDomainToNext(**) | redirectVersionDomainToNext(**) |
 * |-----------|--------|---------------------------------|---------------------------------|
 *
 * (*):  Only if `v<RC>` > `v<STABLE>`.
 * (**): Only if (no active RC and `v<NEXT>` > `v<STABLE>`) or (active RC and `v<NEXT>` > `v<RC>`).
 *
 * NOTES:
 *   - The `v<X>-angular-io-site` Firebase site should be created (and connected to the
 *     `v<X>.angular.io` subdomain) before the version in the `main` branch's `package.json` is
 *     updated to a new major.
 *   - When a new major version is released, the deploy CI jobs for the new stable branch (prev. RC
 *     or next) and the old stable branch must be run AFTER the new stable version has been
 *     published to NPM, because the NPM info is used to determine what the stable version is.
 *     In the future, we could make the branch version info retrieval more robust, DRY and
 *     future-proof (and independent of NPM releases) by re-using the `ng-dev release info`
 *     [implementation](https://github.com/angular/dev-infra/blob/92778223953e029d1723febf282bb265b4e2a56f/ng-dev/release/info/cli.ts).
 *     (This would require `ng-dev` to expose an API for requesting the info (instead of printing it
 *     in human-readable format to stdout).)
 */

import path from 'path';
import sh from 'shelljs';
import {fileURLToPath} from 'url';
import post from './post-deploy-actions.mjs';
import pre from './pre-deploy-actions.mjs';
import u from './utils.mjs';

sh.set('-e');


// Constants
const inBazelTest = !!process.env.TEST_SRCDIR;
const DIRNAME = !inBazelTest
  ? u.getDirname(import.meta.url)
  : path.join('.', 'aio', 'scripts', 'deploy-to-firebase');
const ROOT_PKG_PATH = `${DIRNAME}/../../../package.json`;

// Exports
export {
  computeDeploymentsInfo,
  computeInputVars,
  skipDeployment,
  validateDeploymentsInfo,
};

// Run
// ESM alternative for CommonJS' `require.main === module`. For simplicity, we assume command
// references the full file path (including the file extension).
// See https://stackoverflow.com/questions/45136831/node-js-require-main-module#answer-60309682 for
// more details.
const isMain = inBazelTest ||
  (fileURLToPath(import.meta.url) === process.argv[1]);
if (isMain) {
  const isDryRun = process.argv[2] === '--dry-run';
  const inputVars = computeInputVars(process.env);
  const deploymentsInfo = computeDeploymentsInfo(inputVars);
  const totalDeployments = deploymentsInfo.length;

  validateDeploymentsInfo(deploymentsInfo);

  console.log(`Deployments (${totalDeployments}): ${listDeployTargetNames(deploymentsInfo)}`);

  deploymentsInfo.forEach((deploymentInfo, idx) => {
    const logLine1 = `Deployment ${idx + 1} of ${totalDeployments}: ${deploymentInfo.name}`;
    console.log(`\n\n\n${logLine1}\n${'-'.repeat(logLine1.length)}`);

    if (deploymentInfo.type === 'skipped') {
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
function computeDeploymentsInfo(
    {currentBranch, currentCommit, isPullRequest, repoName, repoOwner, stableBranch}) {
  // Do not deploy if we are running in a fork.
  if (`${repoOwner}/${repoName}` !== u.REPO_SLUG) {
    return [skipDeployment(`Skipping deploy because this is not ${u.REPO_SLUG}.`)];
  }

  // Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
  if (isPullRequest) {
    return [skipDeployment('Skipping deploy because this is a PR build.')];
  }

  // Do not deploy if the current commit is not the latest on its branch.
  const latestCommit = u.getLatestCommit(currentBranch);
  if (currentCommit !== latestCommit) {
    return [
      skipDeployment(
          `Skipping deploy because ${currentCommit} is not the latest commit (${latestCommit}).`),
    ];
  }

  // The deployment mode is computed based on the branch we are building.
  const currentVersionPattern =  /^\d+\.\d+\.x$/.test(currentBranch) ?
    currentBranch :  // The current branch name is a version pattern.
    u.loadJson(ROOT_PKG_PATH).version;  // We need to retrieve the version from `package.json`.
  const currentBranchMajorVersion = u.computeMajorVersion(currentVersionPattern);
  const stableBranchMajorVersion = u.computeMajorVersion(stableBranch);
  const deploymentInfoPerTarget = {
    // PRIMARY DEPLOY TARGETS
    //
    // These targets are responsible for building the app (and setting the theme/mode).
    // Unless deployment is skipped, exactly one primary target should be used at a time and it
    // should be the first item of the returned deploy target list.
    next: {
      name: 'next',
      type: 'primary',
      deployEnv: 'next',
      projectId: 'angular-io',
      siteId: 'next-angular-io-site',
      deployedUrl: 'https://next.angular.io/',
      preDeployActions: [pre.build, pre.checkPayloadSize],
      postDeployActions: [post.testPwaScore],
    },
    rc: {
      name: 'rc',
      type: 'primary',
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
      preDeployActions: [pre.build, pre.checkPayloadSize],
      postDeployActions: [post.testPwaScore],
    },
    stable: {
      name: 'stable',
      type: 'primary',
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: 'stable-angular-io-site',
      deployedUrl: 'https://angular.io/',
      preDeployActions: [pre.build, pre.checkPayloadSize],
      postDeployActions: [post.testPwaScore],
    },
    archive: {
      name: 'archive',
      type: 'primary',
      deployEnv: 'archive',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
      preDeployActions: [pre.build, pre.checkPayloadSize],
      postDeployActions: [post.testPwaScore],
    },

    // SECONDARY DEPLOY TARGETS
    //
    // These targets can be used to re-deploy the build artifacts from a primary target (potentially
    // with small tweaks) to a different project/site.
    // Unless deployment is skipped, zero or more secondary targets can be used at a time, but they
    // should all match the primary target's `deployEnv`.
    //
    // TIP:
    // Since there can be multiple secondary deployments (each tweaking the primary one in different
    // ways), it is a good idea to ensure that any pre-deploy actions are undone in the post-deploy
    // phase.
    redirectVersionDomainToNext: {
      name: 'redirectVersionDomainToNext',
      type: 'secondary',
      deployEnv: 'next',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
      preDeployActions: [pre.redirectAllToNext],
      postDeployActions: [pre.undo.redirectAllToNext, post.testRedirectToNext],
    },
    redirectVersionDomainToRc: {
      name: 'redirectVersionDomainToRc',
      type: 'secondary',
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
      preDeployActions: [pre.redirectAllToRc],
      postDeployActions: [pre.undo.redirectAllToRc, post.testRedirectToRc],
    },
    redirectVersionDomainToStable: {
      name: 'redirectVersionDomainToStable',
      type: 'secondary',
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: `v${currentBranchMajorVersion}-angular-io-site`,
      deployedUrl: `https://v${currentBranchMajorVersion}.angular.io/`,
      preDeployActions: [pre.redirectAllToStable],
      postDeployActions: [pre.undo.redirectAllToStable, post.testRedirectToStable],
    },
    // Config for deploying the stable build to the RC Firebase site when there is no active RC.
    // See https://github.com/angular/angular/issues/39760 for more info on the purpose of this
    // special deployment.
    redirectRcToStable: {
      name: 'redirectRcToStable',
      type: 'secondary',
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
      preDeployActions: [pre.disableServiceWorker, pre.redirectNonFilesToStable],
      postDeployActions: [
        pre.undo.redirectNonFilesToStable,
        pre.undo.disableServiceWorker,
        post.testNoActiveRcDeployment,
      ],
    },
  };

  // Determine if there is an active RC version by checking whether the most recent minor branch is
  // the stable branch or not.
  const mostRecentMinorBranch = u.getMostRecentMinorBranch();
  const rcBranch = (mostRecentMinorBranch !== stableBranch) ? mostRecentMinorBranch : null;
  const isRcActive = rcBranch !== null;

  // If the current branch is `main`, deploy as `next`.
  if (currentBranch === 'main') {
    // In order to determine whether to also deploy to `v<NEXT>-angular-io-site` we need to compare
    // `v<NEXT>` with either `v<RC>` (if there is an active RC) or `v<STABLE>`.
    const otherVersion = isRcActive ? u.computeMajorVersion(rcBranch) : stableBranchMajorVersion;

    return (currentBranchMajorVersion > otherVersion) ?
      // The next major version is greater than the RC or stable major version.
      // Deploy to both `next-angular-io-site` and `v<NEXT>-angular-io-site`.
      [
        deploymentInfoPerTarget.next,
        deploymentInfoPerTarget.redirectVersionDomainToNext,
      ] :
      // The next major version is not greater than the RC or stable major version.
      // Only deploy to `next-angular-io-site` (since `v<NEXT>-angular-io-site` is probably
      // `v<RC>-angular-io-site` or `v<STABLE>-angular-io-site` and we don't want to overwrite the
      // RC or stable deployment).
      [
        deploymentInfoPerTarget.next,
      ];
  }

  // If the current branch is the RC branch, deploy as `rc`.
  if (currentBranch === rcBranch) {
    return (currentBranchMajorVersion > stableBranchMajorVersion) ?
      // The RC major version is greater than the stable major version.
      // Deploy to both `rc-angular-io-site` and `v<RC>-angular-io-site`.
      [
        deploymentInfoPerTarget.rc,
        deploymentInfoPerTarget.redirectVersionDomainToRc,
      ] :
      // The RC major version is not greater than the stable major version.
      // Only deploy to `rc-angular-io-site` (since `v<RC>-angular-io-site` is probably
      // `v<STABLE>-angular-io-site` and we don't want to overwrite the stable deployment).
      [
        deploymentInfoPerTarget.rc,
      ];
  }

  // If the current branch is the stable branch, deploy as `stable`.
  if (currentBranch === stableBranch) {
    return isRcActive ?
      // There is an active RC version. Only deploy to the `stable` projects/sites.
      [
        deploymentInfoPerTarget.stable,
        deploymentInfoPerTarget.redirectVersionDomainToStable,
      ] :
      // There is no active RC version. In addition to deploying to the `stable` projects/sites,
      // deploy to `rc` to ensure it redirects to `stable`.
      // See https://github.com/angular/angular/issues/39760 for more info on the purpose of this
      // special deployment.
      [
        deploymentInfoPerTarget.stable,
        deploymentInfoPerTarget.redirectVersionDomainToStable,
        deploymentInfoPerTarget.redirectRcToStable,
      ];
  }

  // If we get here, it means that the current branch is neither `main`, nor the RC or stable
  // branches. At this point, we may only deploy as `archive` and only if the following criteria are
  // met:
  //   1. The current branch must have the highest minor version among all branches with the same
  //      major version.
  //   2. The current branch must have a major version that is lower than the stable major version.

  // Do not deploy if it is not the branch with the highest minor for the given major version.
  const mostRecentMinorBranchForMajor = u.getMostRecentMinorBranch(currentBranchMajorVersion);
  if (currentBranch !== mostRecentMinorBranchForMajor) {
    return [
      skipDeployment(
          `Skipping deploy of branch "${currentBranch}" to Firebase.\n` +
          'There is a more recent branch with the same major version: ' +
          `"${mostRecentMinorBranchForMajor}"`),
    ];
  }

  // Do not deploy if it does not have a lower major version than stable.
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

function deploy(data) {
  const {
    currentCommit,
    firebaseToken,
    postDeployActions,
    preDeployActions,
    projectId,
    siteId,
  } = data;

  sh.cd(`${DIRNAME}/../..`);

  u.logSectionHeader('Run pre-deploy actions.');
  preDeployActions.forEach(fn => fn(data));

  u.logSectionHeader('Deploy AIO to Firebase hosting.');
  const firebase = cmd => u.yarn(`firebase ${cmd} --token "${firebaseToken}"`);
  firebase(`use "${projectId}"`);
  firebase('target:clear hosting aio');
  firebase(`target:apply hosting aio "${siteId}"`);
  firebase(
      `deploy --only database,hosting:aio --message "Commit: ${currentCommit}" --non-interactive`);

  u.logSectionHeader('Run post-deploy actions.');
  postDeployActions.forEach(fn => fn(data));
}

function listDeployTargetNames(deploymentsList) {
  return deploymentsList.map(({name = '<no name>'}) => name).join(', ') || '-';
}

function serializeActions(actions) {
  return actions.map(fn => fn.name).join(', ');
}

function skipDeployment(reason) {
  return {name: 'skipped', type: 'skipped', reason};
}

function validateDeploymentsInfo(deploymentsList) {
  const knownTargetTypes = ['primary', 'secondary', 'skipped'];
  const requiredPropertiesForSkipped = ['name', 'type', 'reason'];
  const requiredPropertiesForNonSkipped = [
    'name', 'type', 'deployEnv', 'projectId', 'siteId', 'deployedUrl', 'preDeployActions',
    'postDeployActions',
  ];

  const primaryTargets = deploymentsList.filter(({type}) => type === 'primary');
  const secondaryTargets = deploymentsList.filter(({type}) => type === 'secondary');
  const skippedTargets = deploymentsList.filter(({type}) => type === 'skipped');
  const otherTargets = deploymentsList.filter(({type}) => !knownTargetTypes.includes(type));

  // Check that all targets have a known `type`.
  if (otherTargets.length > 0) {
    throw new Error(
        `Expected all deploy targets to have a type of ${knownTargetTypes.join(' or ')}, but ` +
        `found ${otherTargets.length} targets with an unknown type: ` +
        otherTargets.map(({name = '<no name>', type}) => `${name} (type: ${type})`).join(', '));
  }

  // Check that all targets have the required properties.
  for (const target of deploymentsList) {
    const requiredProperties = (target.type === 'skipped') ?
      requiredPropertiesForSkipped : requiredPropertiesForNonSkipped;
    const missingProperties = requiredProperties.filter(prop => target[prop] === undefined);

    if (missingProperties.length > 0) {
      throw new Error(
          `Expected deploy target '${target.name || '<no name>'}' to have all required ` +
          `properties, but it is missing '${missingProperties.join('\', \'')}'.`);
    }
  }

  // If there are skipped targets...
  if (skippedTargets.length > 0) {
    // ...check that exactly one target has been specified.
    if (deploymentsList.length > 1) {
      throw new Error(
          `Expected a single skipped deploy target, but found ${deploymentsList.length} targets ` +
          `in total: ${listDeployTargetNames(deploymentsList)}`);
    }

    // There is only one skipped deploy target and it is valid (i.e. has all required properties).
    return;
  }

  // Check that exactly one primary target has been specified.
  if (primaryTargets.length !== 1) {
    throw new Error(
        `Expected exactly one primary deploy target, but found ${primaryTargets.length}: ` +
        listDeployTargetNames(primaryTargets));
  }

  const primaryTarget = primaryTargets[0];
  const primaryIndex = deploymentsList.indexOf(primaryTarget);

  // Check that the primary target is the first item in the list.
  if (primaryIndex !== 0) {
    throw new Error(
        `Expected the primary target (${primaryTarget.name}) to be the first item in the deploy ` +
        `target list, but it was found at index ${primaryIndex} (0-based): ` +
        listDeployTargetNames(deploymentsList));
  }

  const nonMatchingSecondaryTargets =
      secondaryTargets.filter(({deployEnv}) => deployEnv !== primaryTarget.deployEnv);

  // Check that all secondary targets (if any) match the primary target's `deployEnv`.
  if (nonMatchingSecondaryTargets.length > 0) {
    throw new Error(
        'Expected all secondary deploy targets to match the primary target\'s `deployEnv` ' +
        `(${primaryTarget.deployEnv}), but ${nonMatchingSecondaryTargets.length} targets do not: ` +
        nonMatchingSecondaryTargets.map(t => `${t.name} (deployEnv: ${t.deployEnv})`).join(', '));
  }
}
