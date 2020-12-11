#!/usr/bin/env node
'use strict';

const {execSync} = require('child_process');
const {
  computeDeploymentsInfo,
  computeInputVars,
  computeMajorVersion,
  getLatestCommit,
  getMostRecentMinorBranch,
} = require('./deploy-to-firebase');


describe('deploy-to-firebase:', () => {
  // Pre-computed values to avoid unnecessary re-computations.
  const mostRecentMinorBranch = getMostRecentMinorBranch();
  const latestCommits = {
    master: getLatestCommit('master'),
    '2.1.x': getLatestCommit('2.1.x'),
    '2.4.x': getLatestCommit('2.4.x'),
    '4.3.x': getLatestCommit('4.3.x'),
    '4.4.x': getLatestCommit('4.4.x'),
    '9.1.x': getLatestCommit('9.1.x'),
    [mostRecentMinorBranch]: getLatestCommit(mostRecentMinorBranch),
  };

  // Helpers
  const jsonFunctionReplacer = (_key, val) =>
    (typeof val === 'function') ? `function:${val.name}` : val;
  const getDeploymentsInfoFor = env => {
    const deploymentsInfo = computeDeploymentsInfo(computeInputVars(env));
    return JSON.parse(JSON.stringify(deploymentsInfo, jsonFunctionReplacer));
  };

  it('master - skip deploy - not angular', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'notangular',
    })).toEqual([
      {
        skipped: true,
        reason: 'Skipping deploy because this is not angular/angular.',
      },
    ]);
  });

  it('master - skip deploy - angular fork', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'notangular',
      CI_REPO_NAME: 'angular',
    })).toEqual([
      {
        skipped: true,
        reason: 'Skipping deploy because this is not angular/angular.',
      },
    ]);
  });

  it('master - skip deploy - pull request', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'true',
    })).toEqual([
      {
        skipped: true,
        reason: 'Skipping deploy because this is a PR build.',
      },
    ]);
  });

  it('master - deploy success', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: latestCommits.master,
    })).toEqual([
      {
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: 'next-angular-io-site',
        deployedUrl: 'https://next.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('master - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits.master}).`,
      },
    ]);
  });

  it('stable - deploy success - active RC', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['4.3.x'],
    })).toEqual([
      {
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'v4-angular-io-site',
        deployedUrl: 'https://angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('stable - deploy success - no active RC', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: mostRecentMinorBranch,
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: `v${computeMajorVersion(mostRecentMinorBranch)}-angular-io-site`,
        deployedUrl: 'https://angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:removeServiceWorker', 'function:redirectToAngularIo'],
        postDeployActions: ['function:testNoActiveRcDeployment'],
      },
    ]);
  });

  it('stable - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits['4.3.x']}).`,
      },
    ]);
  });

  it('archive - deploy success', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['2.4.x'],
    })).toEqual([
      {
        deployEnv: 'archive',
        projectId: 'angular-io',
        siteId: 'v2-angular-io-site',
        deployedUrl: 'https://v2.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  // v9 used to be special-cased, because it was piloting the Firebase hosting "multisites" setup.
  // See https://angular-team.atlassian.net/browse/DEV-125 for more info.
  it('archive - deploy success (no special case for v9)', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '9.1.x',
      CI_STABLE_BRANCH: '10.0.x',
      CI_COMMIT: latestCommits['9.1.x'],
    })).toEqual([
      {
        deployEnv: 'archive',
        projectId: 'angular-io',
        siteId: 'v9-angular-io-site',
        deployedUrl: 'https://v9.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('archive - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits['2.4.x']}).`,
      },
    ]);
  });

  it('archive - skip deploy - major same as stable, minor lower than stable', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('archive - skip deploy - major lower than stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('rc - deploy success - major higher than stable', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        deployEnv: 'rc',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('rc - deploy success - major same as stable, minor highest for major', () => {
    // Create a stable branch name that has the same major and lower minor than
    // `mostRecentMinorBranch`.
    // NOTE: Since `mostRecentMinorBranch` can have a minor version of `0`, we may end up with `-1`
    //       as the minor version for stable. This is a hack, but it works ¯\_(ツ)_/¯
    const stableBranch = mostRecentMinorBranch.replace(
        /^(\d+)\.(\d+)\.x$/, (_, major, minor) => `${major}.${minor - 1}.x`);

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: stableBranch,
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        deployEnv: 'rc',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('rc - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits[mostRecentMinorBranch]}).`,
      },
    ]);
  });

  it('rc - skip deploy - major same as stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.0.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('rc - skip deploy - major higher than stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '2.4.x',
      CI_COMMIT: latestCommits['4.3.x'],
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy of branch "4.3.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "4.4.x"',
      },
    ]);
  });

  it('rc - skip deploy - major higher than stable but not highest, minor highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.4.x',
      CI_STABLE_BRANCH: '2.4.x',
      CI_COMMIT: latestCommits['4.4.x'],
    })).toEqual([
      {
        skipped: true,
        reason:
            'Skipping deploy of branch "4.4.x" to Firebase.\n' +
            'This branch has an equal or higher major version than the stable branch ("2.4.x") ' +
            'and is not the most recent minor branch.',
      },
    ]);
  });

  it('integration - should run the main script without error', () => {
    // NOTE:
    // This test executes a new instance of the `deploy-to-firebase.js` script on a separate process
    // and thus does not share the `getRemoteRefs()` cache. To improve stability, we retrieve the
    // latest commit from master ignoring any cached entries.
    const latestCommitOnMaster = getLatestCommit('master', {retrieveFromCache: false});
    const cmd = `"${process.execPath}" "${__dirname}/deploy-to-firebase" --dry-run`;
    const env = {
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: latestCommitOnMaster,
    };
    const result = execSync(cmd, {encoding: 'utf8', env}).trim();
    expect(result).toBe(
        'Total deployments: 1\n' +
        '\n' +
        '\n' +
        '\n' +
        'Deployment 1 of 1\n' +
        '-----------------\n' +
        'Git branch          : master\n' +
        `Git commit          : ${latestCommitOnMaster}\n` +
        'Build/deploy mode   : next\n' +
        'Firebase project    : angular-io\n' +
        'Firebase site       : next-angular-io-site\n' +
        'Pre-deploy actions  : build, checkPayloadSize\n' +
        'Post-deploy actions : testPwaScore\n' +
        'Deployment URLs     : https://next.angular.io/\n' +
        '                      https://next-angular-io-site.web.app/');
  });
});
