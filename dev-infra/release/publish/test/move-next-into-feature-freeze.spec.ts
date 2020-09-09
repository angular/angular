/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getBranchPushMatcher} from '../../../utils/testing';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import * as npm from '../../versioning/npm-publish';
import {ReleaseTrain} from '../../versioning/release-trains';
import {MoveNextIntoFeatureFreezeAction} from '../actions/move-next-into-feature-freeze';
import * as externalCommands from '../external-commands';

import {getChangelogForVersion, parse, setupReleaseActionForTesting, testTmpDir} from './test-utils';

describe('move next into feature-freeze action', () => {
  it('should not activate if a feature-freeze release-train is active', async () => {
    expect(await MoveNextIntoFeatureFreezeAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should not activate if release-candidate release-train is active', async () => {
    expect(await MoveNextIntoFeatureFreezeAction.isActive({
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should activate if no FF/RC release-train is active', async () => {
    expect(await MoveNextIntoFeatureFreezeAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should create pull requests and feature-freeze branch', async () => {
    await expectVersionAndBranchToBeCreated(
        {
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        },
        /* isNextPublishedToNpm */ true, '10.3.0-next.0', '10.2.0-next.1', '10.2.x');
  });

  it('should not increment the version if "next" version is not yet published', async () => {
    await expectVersionAndBranchToBeCreated(
        {
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        },
        /* isNextPublishedToNpm */ false, '10.3.0-next.0', '10.2.0-next.0', '10.2.x');
  });

  /** Performs the action and expects versions and branches to be determined properly. */
  async function expectVersionAndBranchToBeCreated(
      active: ActiveReleaseTrains, isNextPublishedToNpm: boolean, expectedNextVersion: string,
      expectedVersion: string, expectedNewBranch: string) {
    const {repo, fork, instance, gitClient, releaseConfig} =
        setupReleaseActionForTesting(MoveNextIntoFeatureFreezeAction, active, isNextPublishedToNpm);

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
        .expectChangelogFetch(expectedNewBranch, getChangelogForVersion(expectedVersion))
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
            'Expected feature-freeze branch to be created upstream and based on "master".');
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
    expect(releaseConfig.generateReleaseNotesForHead).toHaveBeenCalledTimes(1);
    expect(npm.runNpmPublish).toHaveBeenCalledTimes(2);
    expect(npm.runNpmPublish).toHaveBeenCalledWith(`${testTmpDir}/dist/pkg1`, 'next', undefined);
    expect(npm.runNpmPublish).toHaveBeenCalledWith(`${testTmpDir}/dist/pkg2`, 'next', undefined);
  }
});
