/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import * as nock from 'nock';
import {join} from 'path';
import * as semver from 'semver';

import {GithubConfig} from '../../../utils/config';
import * as console from '../../../utils/console';
import {getBranchPushMatcher, VirtualGitClient} from '../../../utils/testing';
import {ReleaseConfig} from '../../config/index';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import * as npm from '../../versioning/npm-publish';
import {_npmPackageInfoCache, NpmPackageInfo} from '../../versioning/npm-registry';
import {ReleaseAction, ReleaseActionConstructor} from '../actions';
import * as constants from '../constants';
import * as externalCommands from '../external-commands';

import {GithubTestingRepo} from './github-api-testing';

/**
 * Temporary directory which will be used as project directory in tests. Note that
 * this environment variable is automatically set by Bazel for tests.
 */
export const testTmpDir: string = process.env['TEST_TMPDIR']!;

/** Interface describing a test release action. */
export interface TestReleaseAction<T extends ReleaseAction = ReleaseAction> {
  instance: T;
  gitClient: VirtualGitClient;
  repo: GithubTestingRepo;
  fork: GithubTestingRepo;
  testTmpDir: string;
  githubConfig: GithubConfig;
  releaseConfig: ReleaseConfig;
}

/** Gets necessary test mocks for running a release action. */
export function getTestingMocksForReleaseAction() {
  const githubConfig = {owner: 'angular', name: 'dev-infra-test'};
  const gitClient = new VirtualGitClient(undefined, {github: githubConfig}, testTmpDir);
  const releaseConfig: ReleaseConfig = {
    npmPackages: [
      '@angular/pkg1',
      '@angular/pkg2',
    ],
    generateReleaseNotesForHead: jasmine.createSpy('generateReleaseNotesForHead').and.resolveTo(),
    buildPackages: () => {
      throw Error('Not implemented');
    },
  };
  return {githubConfig, gitClient, releaseConfig};
}

/**
 * Sets up the given release action for testing.
 * @param actionCtor Type of release action to be tested.
 * @param active Fake active release trains for the action,
 * @param isNextPublishedToNpm Whether the next version is published to NPM. True by default.
 */
export function setupReleaseActionForTesting<T extends ReleaseAction>(
    actionCtor: ReleaseActionConstructor<T>, active: ActiveReleaseTrains,
    isNextPublishedToNpm = true): TestReleaseAction<T> {
  // Reset existing HTTP interceptors.
  nock.cleanAll();

  const {gitClient, githubConfig, releaseConfig} = getTestingMocksForReleaseAction();
  const repo = new GithubTestingRepo(githubConfig.owner, githubConfig.name);
  const fork = new GithubTestingRepo('some-user', 'fork');

  // The version for the release-train in the next phase does not necessarily need to be
  // published to NPM. We mock the NPM package request and fake the state of the next
  // version based on the `isNextPublishedToNpm` testing parameter. More details on the
  // special case for the next release train can be found in the next pre-release action.
  fakeNpmPackageQueryRequest(
      releaseConfig.npmPackages[0],
      {versions: {[active.next.version.format()]: isNextPublishedToNpm ? {} : undefined}});

  const action = new actionCtor(active, gitClient, releaseConfig, testTmpDir);

  // Fake confirm any prompts. We do not want to make any changelog edits and
  // just proceed with the release action.
  spyOn(console, 'promptConfirm').and.resolveTo(true);

  // Fake all external commands for the release tool.
  spyOn(npm, 'runNpmPublish').and.resolveTo();
  spyOn(externalCommands, 'invokeSetNpmDistCommand').and.resolveTo();
  spyOn(externalCommands, 'invokeYarnInstallCommand').and.resolveTo();
  spyOn(externalCommands, 'invokeBazelCleanCommand').and.resolveTo();
  spyOn(externalCommands, 'invokeReleaseBuildCommand').and.resolveTo([
    {name: '@angular/pkg1', outputPath: `${testTmpDir}/dist/pkg1`},
    {name: '@angular/pkg2', outputPath: `${testTmpDir}/dist/pkg2`}
  ]);

  // Fake checking the package versions since we don't actually create packages to check against in
  // the publish tests.
  spyOn(ReleaseAction.prototype, '_verifyPackageVersions' as any).and.resolveTo();

  // Create an empty changelog and a `package.json` file so that file system
  // interactions with the project directory do not cause exceptions.
  writeFileSync(join(testTmpDir, 'CHANGELOG.md'), 'Existing changelog');
  writeFileSync(join(testTmpDir, 'package.json'), JSON.stringify({version: 'unknown'}));

  // Override the default pull request wait interval to a number of milliseconds that can be
  // awaited in Jasmine tests. The default interval of 10sec is too large and causes a timeout.
  Object.defineProperty(constants, 'waitForPullRequestInterval', {value: 50});

  return {instance: action, repo, fork, testTmpDir, githubConfig, releaseConfig, gitClient};
}

/** Parses the specified version into Semver. */
export function parse(version: string): semver.SemVer {
  return semver.parse(version)!;
}

/** Gets a changelog for the specified version. */
export function getChangelogForVersion(version: string): string {
  return `<a name="${version}"></a>Changelog\n\n`;
}

export async function expectStagingAndPublishWithoutCherryPick(
    action: TestReleaseAction, expectedBranch: string, expectedVersion: string,
    expectedNpmDistTag: string) {
  const {repo, fork, gitClient, releaseConfig} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedTagName = expectedVersion;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo.expectBranchRequest(expectedBranch, 'MASTER_COMMIT_SHA')
      .expectCommitStatusCheck('MASTER_COMMIT_SHA', 'success')
      .expectFindForkRequest(fork)
      .expectPullRequestToBeCreated(expectedBranch, fork, expectedStagingForkBranch, 200)
      .expectPullRequestWait(200)
      .expectBranchRequest(expectedBranch, 'STAGING_COMMIT_SHA')
      .expectCommitRequest(
          'STAGING_COMMIT_SHA', `release: cut the v${expectedVersion} release\n\nPR Close #200.`)
      .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
      .expectReleaseToBeCreated(`v${expectedVersion}`, expectedTagName);

  // In the fork, we make the staging branch appear as non-existent,
  // so that the PR can be created properly without collisions.
  fork.expectBranchRequest(expectedStagingForkBranch, null);

  await action.instance.perform();

  expect(gitClient.pushed.length).toBe(1);
  expect(gitClient.pushed[0])
      .toEqual(
          getBranchPushMatcher({
            baseBranch: expectedBranch,
            baseRepo: repo,
            targetBranch: expectedStagingForkBranch,
            targetRepo: fork,
            expectedCommits: [{
              message: `release: cut the v${expectedVersion} release`,
              files: ['package.json', 'CHANGELOG.md'],
            }],
          }),
          'Expected release staging branch to be created in fork.');

  expect(externalCommands.invokeReleaseBuildCommand).toHaveBeenCalledTimes(1);
  expect(releaseConfig.generateReleaseNotesForHead).toHaveBeenCalledTimes(1);
  expect(npm.runNpmPublish).toHaveBeenCalledTimes(2);
  expect(npm.runNpmPublish)
      .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg1`, expectedNpmDistTag, undefined);
  expect(npm.runNpmPublish)
      .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg2`, expectedNpmDistTag, undefined);
}

export async function expectStagingAndPublishWithCherryPick(
    action: TestReleaseAction, expectedBranch: string, expectedVersion: string,
    expectedNpmDistTag: string) {
  const {repo, fork, gitClient, releaseConfig} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedCherryPickForkBranch = `changelog-cherry-pick-${expectedVersion}`;
  const expectedTagName = expectedVersion;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo.expectBranchRequest(expectedBranch, 'MASTER_COMMIT_SHA')
      .expectCommitStatusCheck('MASTER_COMMIT_SHA', 'success')
      .expectFindForkRequest(fork)
      .expectPullRequestToBeCreated(expectedBranch, fork, expectedStagingForkBranch, 200)
      .expectPullRequestWait(200)
      .expectBranchRequest(expectedBranch, 'STAGING_COMMIT_SHA')
      .expectCommitRequest(
          'STAGING_COMMIT_SHA', `release: cut the v${expectedVersion} release\n\nPR Close #200.`)
      .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
      .expectReleaseToBeCreated(`v${expectedVersion}`, expectedTagName)
      .expectChangelogFetch(expectedBranch, getChangelogForVersion(expectedVersion))
      .expectPullRequestToBeCreated('master', fork, expectedCherryPickForkBranch, 300)
      .expectPullRequestWait(300);

  // In the fork, we make the staging and cherry-pick branches appear as
  // non-existent, so that the PRs can be created properly without collisions.
  fork.expectBranchRequest(expectedStagingForkBranch, null)
      .expectBranchRequest(expectedCherryPickForkBranch, null);

  await action.instance.perform();

  expect(gitClient.pushed.length).toBe(2);
  expect(gitClient.pushed[0])
      .toEqual(
          getBranchPushMatcher({
            baseBranch: expectedBranch,
            baseRepo: repo,
            targetBranch: expectedStagingForkBranch,
            targetRepo: fork,
            expectedCommits: [{
              message: `release: cut the v${expectedVersion} release`,
              files: ['package.json', 'CHANGELOG.md'],
            }],
          }),
          'Expected release staging branch to be created in fork.');

  expect(gitClient.pushed[1])
      .toEqual(
          getBranchPushMatcher({
            baseBranch: 'master',
            baseRepo: repo,
            targetBranch: expectedCherryPickForkBranch,
            targetRepo: fork,
            expectedCommits: [{
              message: `docs: release notes for the v${expectedVersion} release`,
              files: ['CHANGELOG.md'],
            }],
          }),
          'Expected cherry-pick branch to be created in fork.');

  expect(externalCommands.invokeReleaseBuildCommand).toHaveBeenCalledTimes(1);
  expect(releaseConfig.generateReleaseNotesForHead).toHaveBeenCalledTimes(1);
  expect(npm.runNpmPublish).toHaveBeenCalledTimes(2);
  expect(npm.runNpmPublish)
      .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg1`, expectedNpmDistTag, undefined);
  expect(npm.runNpmPublish)
      .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg2`, expectedNpmDistTag, undefined);
}

/** Fakes a NPM package query API request for the given package. */
export function fakeNpmPackageQueryRequest(pkgName: string, data: Partial<NpmPackageInfo>) {
  _npmPackageInfoCache[pkgName] =
      Promise.resolve({'dist-tags': {}, versions: {}, time: {}, ...data});
}
