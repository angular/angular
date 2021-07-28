/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../versioning/release-trains';
import {MoveNextIntoFeatureFreezeAction} from '../actions/move-next-into-feature-freeze';

import {expectBranchOffActionToRun} from './branch-off-next-branch-testing';
import {parse} from './test-utils';

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

  it('should not activate if the next release-train is for a minor', async () => {
    expect(await MoveNextIntoFeatureFreezeAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.2')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should activate if no FF/RC release-train is active', async () => {
    expect(await MoveNextIntoFeatureFreezeAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('11.0.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should create pull requests and feature-freeze branch', async () => {
    await expectBranchOffActionToRun(
        MoveNextIntoFeatureFreezeAction, {
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        },
        /* isNextPublishedToNpm */ true, '10.3.0-next.0', '10.2.0-next.1', '10.2.x');
  });

  it('should not increment the version if "next" version is not yet published', async () => {
    await expectBranchOffActionToRun(
        MoveNextIntoFeatureFreezeAction, {
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        },
        /* isNextPublishedToNpm */ false, '10.3.0-next.0', '10.2.0-next.0', '10.2.x');
  });
});
