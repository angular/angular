/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../../utils/testing/semver-matchers';
import {ReleaseTrain} from '../../versioning/release-trains';
import {CutStableAction} from '../actions/cut-stable';
import * as externalCommands from '../external-commands';

import {expectStagingAndPublishWithCherryPick, parse, setupReleaseActionForTesting} from './test-utils';

describe('cut stable action', () => {
  it('should not activate if a feature-freeze release-train is active', async () => {
    expect(await CutStableAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should activate if release-candidate release-train is active', async () => {
    expect(await CutStableAction.isActive({
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should not activate if no FF/RC release-train is active', async () => {
    expect(await CutStableAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(false);
  });

  it('should create a proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(CutStableAction, {
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest');
  });

  it('should not tag the previous latest release-train if a minor has been cut', async () => {
    const action = setupReleaseActionForTesting(CutStableAction, {
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    });

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest');
    expect(externalCommands.invokeSetNpmDistCommand).toHaveBeenCalledTimes(0);
  });

  it('should tag the previous latest release-train if a major has been cut', async () => {
    const action = setupReleaseActionForTesting(CutStableAction, {
      // No longer in feature-freeze but in release-candidate phase.
      releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    });

    // Ensure that the NPM dist tag is set only for packages that were available in the previous
    // major version. A spy has already been installed on the function.
    (externalCommands.invokeSetNpmDistCommand as jasmine.Spy).and.callFake(() => {
      expect(action.gitClient.head.ref?.name).toBe('10.0.x');
      return Promise.resolve();
    });

    // Major is released to the `next` NPM dist tag initially. Can be re-tagged with
    // a separate release action. See `CutStableAction` for more details.
    await expectStagingAndPublishWithCherryPick(action, '11.0.x', '11.0.0', 'next');
    expect(externalCommands.invokeSetNpmDistCommand).toHaveBeenCalledTimes(1);
    expect(externalCommands.invokeSetNpmDistCommand)
        .toHaveBeenCalledWith('v10-lts', matchesVersion('10.0.3'));
  });
});
