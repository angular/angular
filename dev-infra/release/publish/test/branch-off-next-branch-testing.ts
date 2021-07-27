/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getBranchPushMatcher} from '../../../utils/testing';
import {ActiveReleaseTrains} from '../../versioning';
import * as npm from '../../versioning/npm-publish';
import {ReleaseActionConstructor} from '../actions';
import {BranchOffNextBranchBaseAction} from '../actions/branch-off-next-branch';
import * as externalCommands from '../external-commands';

import {setupReleaseActionForTesting, testTmpDir} from './test-utils';

/**
 * Performs the given branch-off release action and expects versions and
 * branches to be determined and created properly.
 */
export async function expectBranchOffActionToRun(
    action: ReleaseActionConstructor<BranchOffNextBranchBaseAction>, active: ActiveReleaseTrains,
    isNextPublishedToNpm: boolean, expectedNextVersion: string, expectedVersion: string,
    expectedNewBranch: string) {
  const {repo, fork, instance, gitClient} =
      setupReleaseActionForTesting(action, active, isNextPublishedToNpm);

  const expectedNextUpdateBranch = `next-release-train-${expectedNextVersion}`;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedTagName = expectedVersion;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo.expectBranchRequest('master', 'MASTER_COMMIT_SHA')
      .expectCommitStatusCheck('MASTER_COMMIT_SHA', 'success')
      .expectFindForkRequest(fork)
      .expectPullRequestToBeCreated(expectedNewBranch, fork, expectedStagingForkBranch, 200)
      .expectPullRequestWait(200)
      .expectBranchRequest(expectedNewBranch, 'STAGING_COMMIT_SHA')
      .expectCommitRequest(
          'STAGING_COMMIT_SHA', `release: cut the v${expectedVersion} release\n\nPR Close #200.`)
      .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
      .expectReleaseToBeCreated(`v${expectedVersion}`, expectedTagName)
      .expectPullRequestToBeCreated('master', fork, expectedNextUpdateBranch, 100);

  // In the fork, we make the following branches appear as non-existent,
  // so that the PRs can be created properly without collisions.
  fork.expectBranchRequest(expectedStagingForkBranch, null)
      .expectBranchRequest(expectedNextUpdateBranch, null);

  await instance.perform();

  expect(gitClient.pushed.length).toBe(3);
  expect(gitClient.pushed[0])
      .toEqual(
          getBranchPushMatcher({
            baseRepo: repo,
            baseBranch: 'master',
            targetRepo: repo,
            targetBranch: expectedNewBranch,
            expectedCommits: [],
          }),
          'Expected new version-branch to be created upstream and based on "master".');
  expect(gitClient.pushed[1])
      .toEqual(
          getBranchPushMatcher({
            baseBranch: 'master',
            baseRepo: repo,
            targetBranch: expectedStagingForkBranch,
            targetRepo: fork,
            expectedCommits: [{
              message: `release: cut the v${expectedVersion} release`,
              files: ['package.json', 'CHANGELOG.md'],
            }],
          }),
          'Expected release staging branch to be created in fork.');

  expect(gitClient.pushed[2])
      .toEqual(
          getBranchPushMatcher({
            baseBranch: 'master',
            baseRepo: repo,
            targetBranch: expectedNextUpdateBranch,
            targetRepo: fork,
            expectedCommits: [
              {
                message: `release: bump the next branch to v${expectedNextVersion}`,
                files: ['package.json']
              },
              {
                message: `docs: release notes for the v${expectedVersion} release`,
                files: ['CHANGELOG.md']
              },
            ],
          }),
          'Expected next release-train update branch be created in fork.');

  expect(externalCommands.invokeReleaseBuildCommand).toHaveBeenCalledTimes(1);
  expect(npm.runNpmPublish).toHaveBeenCalledTimes(2);
  expect(npm.runNpmPublish).toHaveBeenCalledWith(`${testTmpDir}/dist/pkg1`, 'next', undefined);
  expect(npm.runNpmPublish).toHaveBeenCalledWith(`${testTmpDir}/dist/pkg2`, 'next', undefined);
}
