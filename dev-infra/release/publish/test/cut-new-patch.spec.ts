/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../versioning/release-trains';
import {CutNewPatchAction} from '../actions/cut-new-patch';

import {expectStagingAndPublishWithCherryPick, parse, setupReleaseActionForTesting} from './test-utils';

describe('cut new patch action', () => {
  it('should be active', async () => {
    expect(await CutNewPatchAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should compute proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(CutNewPatchAction, {
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.3', 'latest');
  });

  it('should create a proper new version if there is a feature-freeze release-train', async () => {
    const action = setupReleaseActionForTesting(CutNewPatchAction, {
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.9')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.10', 'latest');
  });

  it('should create a proper new version if there is a release-candidate train', async () => {
    const action = setupReleaseActionForTesting(CutNewPatchAction, {
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.9')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.10', 'latest');
  });
});
