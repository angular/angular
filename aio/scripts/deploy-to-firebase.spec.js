#!/usr/bin/env node
'use strict';

const {execSync} = require('child_process');


describe('deploy-to-firebase:', () => {
  const deployToFirebaseCmd = `"${process.execPath}" "${__dirname}/deploy-to-firebase" --dry-run`;

  // Helpers
  const deployToFirebaseDryRun =
      env => execSync(deployToFirebaseCmd, {encoding: 'utf8', env}).toString().trim();
  const getLatestCommitForBranch =
      branch => execSync(`git ls-remote origin ${branch}`).slice(0, 40);

  it('master - skip deploy - not angular', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'notangular',
    })).toBe('Skipping deploy because this is not angular/angular.');
  });

  it('master - skip deploy - angular fork', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'notangular',
      CI_REPO_NAME: 'angular',
    })).toBe('Skipping deploy because this is not angular/angular.');
  });

  it('master - skip deploy - pull request', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'true',
    })).toBe('Skipping deploy because this is a PR build.');
  });

  it('master - deploy success', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: getLatestCommitForBranch('master'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Git branch        : master\n' +
        'Build/deploy mode : next\n' +
        'Firebase project  : aio-staging\n' +
        'Firebase site     : aio-staging\n' +
        'Deployment URL    : https://next.angular.io/');
  });

  it('master - skip deploy - commit not HEAD', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'master',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toBe(
        'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
        `(${getLatestCommitForBranch('master')}).`);
  });

  it('stable - deploy success', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommitForBranch('4.3.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Git branch        : 4.3.x\n' +
        'Build/deploy mode : stable\n' +
        'Firebase project  : angular-io\n' +
        'Firebase site     : angular-io\n' +
        'Deployment URL    : https://angular.io/');
  });

  it('stable - skip deploy - commit not HEAD', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toBe(
        'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
        `(${getLatestCommitForBranch('4.3.x')}).`);
  });

  it('archive - deploy success', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommitForBranch('2.4.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Git branch        : 2.4.x\n' +
        'Build/deploy mode : archive\n' +
        'Firebase project  : v2-angular-io\n' +
        'Firebase site     : v2-angular-io\n' +
        'Deployment URL    : https://v2.angular.io/');
  });

  it('archive - v9-angular-io multisite special case - deploy success', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '9.1.x',
      CI_STABLE_BRANCH: '10.0.x',
      CI_COMMIT: getLatestCommitForBranch('9.1.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Git branch        : 9.1.x\n' +
        'Build/deploy mode : archive\n' +
        'Firebase project  : aio-staging\n' +
        'Firebase site     : v9-angular-io\n' +
        'Deployment URL    : https://v9.angular.io/');
  });

  it('archive - skip deploy - commit not HEAD', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
        `(${getLatestCommitForBranch('2.4.x')}).`);
  });

  it('archive - skip deploy - major version too high, lower minor', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: getLatestCommitForBranch('2.1.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Skipping deploy of branch "2.1.x" to Firebase.\n' +
        'We only deploy archive branches with the major version less than the stable branch: ' +
        '"2.2.x"');
  });

  it('archive - skip deploy - major version too high, higher minor', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: getLatestCommitForBranch('2.4.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Skipping deploy of branch "2.4.x" to Firebase.\n' +
        'We only deploy archive branches with the major version less than the stable branch: ' +
        '"2.2.x"');
  });

  it('archive - skip deploy - minor version too low', () => {
    expect(deployToFirebaseDryRun({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: getLatestCommitForBranch('2.1.x'),
      CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN: 'XXXXX',
    })).toBe(
        'Skipping deploy of branch "2.1.x" to Firebase.\n' +
        'There is a more recent branch with the same major version: "2.4.x"');
  });
});
