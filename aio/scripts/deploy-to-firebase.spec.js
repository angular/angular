#!/usr/bin/env node
'use strict';

const {execSync} = require('child_process');
const {computeDeploymentInfo, computeInputVars, getLatestCommit} = require('./deploy-to-firebase');


describe('deploy-to-firebase:', () => {
  it('master - skip deploy - not angular', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'notangular',
    }))).toEqual({
      skipped: true,
      reason: 'Skipping deploy because this is not angular/angular.',
    });
  });

  it('master - skip deploy - angular fork', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'notangular',
      CI_REPO_NAME: 'angular',
    }))).toEqual({
      skipped: true,
      reason: 'Skipping deploy because this is not angular/angular.',
    });
  });

  it('master - skip deploy - pull request', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'true',
    }))).toEqual({
      skipped: true,
      reason: 'Skipping deploy because this is a PR build.',
    });
  });

  it('master - deploy success', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: getLatestCommit('master'),
    }))).toEqual({
      deployEnv: 'next',
      projectId: 'angular-io',
      siteId: 'next-angular-io-site',
      deployedUrl: 'https://next.angular.io/',
    });
  });

  it('master - skip deploy - commit not HEAD', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
          `(${getLatestCommit('master')}).`,
    });
  });

  it('stable - deploy success', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommit('4.3.x'),
    }))).toEqual({
      deployEnv: 'stable',
      projectId: 'angular-io',
      siteId: 'v4-angular-io-site',
      deployedUrl: 'https://angular.io/',
    });
  });

  it('stable - skip deploy - commit not HEAD', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
          `(${getLatestCommit('4.3.x')}).`,
    });
  });

  it('archive - deploy success', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommit('2.4.x'),
    }))).toEqual({
      deployEnv: 'archive',
      projectId: 'angular-io',
      siteId: 'v2-angular-io-site',
      deployedUrl: 'https://v2.angular.io/',
    });
  });

  // v9 used to be special-cased, because it was piloting the Firebase hosting "multisites" setup.
  // See https://angular-team.atlassian.net/browse/DEV-125 for more info.
  it('archive - deploy success (no special case for v9)', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '9.1.x',
      CI_STABLE_BRANCH: '10.0.x',
      CI_COMMIT: getLatestCommit('9.1.x'),
    }))).toEqual({
      deployEnv: 'archive',
      projectId: 'angular-io',
      siteId: 'v9-angular-io-site',
      deployedUrl: 'https://v9.angular.io/',
    });
  });

  it('archive - skip deploy - commit not HEAD', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
          `(${getLatestCommit('2.4.x')}).`,
    });
  });

  it('archive - skip deploy - major same as stable, minor less than stable', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: getLatestCommit('2.1.x'),
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy of branch "2.1.x" to Firebase.\n' +
          'There is a more recent branch with the same major version: "2.4.x"',
    });
  });

  it('archive - skip deploy - major lower than stable, minor not latest', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommit('2.1.x'),
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy of branch "2.1.x" to Firebase.\n' +
          'There is a more recent branch with the same major version: "2.4.x"',
    });
  });

  it('rc - deploy success - major higher than stable', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.4.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: getLatestCommit('4.4.x'),
    }))).toEqual({
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
    });
  });

  it('rc - deploy success - major same as stable, minor higher', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: getLatestCommit('2.4.x'),
    }))).toEqual({
      deployEnv: 'rc',
      projectId: 'angular-io',
      siteId: 'rc-angular-io-site',
      deployedUrl: 'https://rc.angular.io/',
    });
  });

  it('rc - skip deploy - commit not HEAD', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
          `(${getLatestCommit('2.4.x')}).`,
    });
  });

  it('rc - skip deploy - major same as stable, minor not latest', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.0.x',
      CI_COMMIT: getLatestCommit('2.1.x'),
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy of branch "2.1.x" to Firebase.\n' +
          'There is a more recent branch with the same major version: "2.4.x"',
    });
  });

  it('rc - skip deploy - major higher than stable, minor not latest', () => {
    expect(computeDeploymentInfo(computeInputVars({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '2.4.x',
      CI_COMMIT: getLatestCommit('4.3.x'),
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy of branch "4.3.x" to Firebase.\n' +
          'There is a more recent branch with the same major version: "4.4.x"',
    });
  });

  it('integration - should run the main script without error', () => {
    const commit = getLatestCommit('master');
    const cmd = `"${process.execPath}" "${__dirname}/deploy-to-firebase" --dry-run`;
    const env = {
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: commit,
    };
    const result = execSync(cmd, {encoding: 'utf8', env}).trim();
    expect(result).toBe(
        'Git branch        : master\n' +
        `Git commit        : ${commit}\n` +
        'Build/deploy mode : next\n' +
        'Firebase project  : angular-io\n' +
        'Firebase site     : next-angular-io-site\n' +
        'Deployment URLs   : https://next.angular.io/\n' +
        '                    https://next-angular-io-site.web.app/');
  });
});
