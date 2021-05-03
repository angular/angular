/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getBranchPushMatcher} from '../../../utils/testing';
import {ReleaseTrain} from '../../versioning/release-trains';
import {ConfigureNextAsMajorAction} from '../actions/configure-next-as-major';

import {parse, setupReleaseActionForTesting} from './test-utils';

describe('configure next as major action', () => {
  it('should be active if the next branch is for a minor', async () => {
    expect(await ConfigureNextAsMajorAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should be active regardless of a feature-freeze/release-candidate train', async () => {
    expect(await ConfigureNextAsMajorAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.1')),
      next: new ReleaseTrain('master', parse('10.2.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should not be active if the next branch is for a major', async () => {
    expect(await ConfigureNextAsMajorAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('11.0.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should compute proper version and create staging pull request', async () => {
    const action = setupReleaseActionForTesting(ConfigureNextAsMajorAction, {
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
    });

    const {repo, fork, gitClient} = action;
    const expectedVersion = `11.0.0-next.0`;
    const expectedForkBranch = `switch-next-to-major-${expectedVersion}`;

    // We first mock the commit status check for the next branch, then expect two pull
    // requests from a fork that are targeting next and the new feature-freeze branch.
    repo.expectBranchRequest('master', 'MASTER_COMMIT_SHA')
        .expectCommitStatusCheck('MASTER_COMMIT_SHA', 'success')
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, expectedForkBranch, 200);

    // In the fork, we make the staging branch appear as non-existent,
    // so that the PR can be created properly without collisions.
    fork.expectBranchRequest(expectedForkBranch, null);

    await action.instance.perform();

    expect(gitClient.pushed.length).toBe(1);
    expect(gitClient.pushed[0])
        .toEqual(
            getBranchPushMatcher({
              baseBranch: 'master',
              baseRepo: repo,
              targetBranch: expectedForkBranch,
              targetRepo: fork,
              expectedCommits: [{
                message: `release: switch the next branch to v${expectedVersion}`,
                files: ['package.json'],
              }],
            }),
            'Expected the update branch to be created in fork for a pull request.');
  });
});
