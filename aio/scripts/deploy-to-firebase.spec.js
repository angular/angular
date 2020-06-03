#!/usr/bin/env node
'use strict';

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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      deployEnv: 'next',
      projectId: 'next-angular-io',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      deployEnv: 'stable',
      projectId: 'v4-angular-io',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      deployEnv: 'archive',
      projectId: 'v2-angular-io',
      deployedUrl: 'https://v2.angular.io/',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      deployEnv: 'rc',
      projectId: 'rc-angular-io',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      deployEnv: 'rc',
      projectId: 'rc-angular-io',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
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
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    }))).toEqual({
      skipped: true,
      reason:
          'Skipping deploy of branch "4.3.x" to Firebase.\n' +
          'There is a more recent branch with the same major version: "4.4.x"',
    });
  });
});
