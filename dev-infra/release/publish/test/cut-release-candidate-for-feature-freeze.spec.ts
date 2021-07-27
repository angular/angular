/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../versioning/release-trains';
import {CutReleaseCandidateForFeatureFreezeAction} from '../actions/cut-release-candidate-for-feature-freeze';

import {expectStagingAndPublishWithCherryPick, parse, setupReleaseActionForTesting} from './test-utils';

describe('cut release candidate for feature-freeze action', () => {
  it('should activate if a feature-freeze release-train is active', async () => {
    expect(await CutReleaseCandidateForFeatureFreezeAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should not activate if release-candidate release-train is active', async () => {
    expect(await CutReleaseCandidateForFeatureFreezeAction.isActive({
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should not activate if no FF/RC release-train is active', async () => {
    expect(await CutReleaseCandidateForFeatureFreezeAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should create a proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(CutReleaseCandidateForFeatureFreezeAction, {
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-rc.0', 'next');
  });
});
