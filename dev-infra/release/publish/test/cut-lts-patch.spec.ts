/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../../utils/testing/semver-matchers';
import {fetchLongTermSupportBranchesFromNpm} from '../../versioning/long-term-support';
import {ReleaseTrain} from '../../versioning/release-trains';
import {CutLongTermSupportPatchAction} from '../actions/cut-lts-patch';

import {expectStagingAndPublishWithCherryPick, fakeNpmPackageQueryRequest, getTestingMocksForReleaseAction, parse, setupReleaseActionForTesting, testTmpDir} from './test-utils';

describe('cut an LTS patch action', () => {
  it('should be active', async () => {
    expect(await CutLongTermSupportPatchAction.isActive({
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should be active if there is a feature-freeze train', async () => {
    expect(await CutLongTermSupportPatchAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
      next: new ReleaseTrain('master', parse('10.2.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should be active if there is a release-candidate train', async () => {
    expect(await CutLongTermSupportPatchAction.isActive({
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
      next: new ReleaseTrain('master', parse('10.2.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
    })).toBe(true);
  });

  it('should compute proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(CutLongTermSupportPatchAction, {
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
    });

    spyOn<any>(action.instance, '_promptForTargetLtsBranch')
        .and.resolveTo({name: '9.2.x', version: parse('9.2.4'), npmDistTag: 'v9-lts'});

    await expectStagingAndPublishWithCherryPick(action, '9.2.x', '9.2.5', 'v9-lts');
  });

  it('should include number of active LTS branches in action description', async () => {
    const {releaseConfig, gitClient} = getTestingMocksForReleaseAction();
    const activeReleaseTrains = {
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.1.0-next.3')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
    };

    fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {
      'dist-tags': {'v9-lts': '9.1.2', 'v8-lts': '8.2.2'},
      'time': {
        '9.0.0': new Date().toISOString(),
        '8.0.0': new Date().toISOString(),
      },
    });

    const action = new CutLongTermSupportPatchAction(
        activeReleaseTrains, gitClient, releaseConfig, testTmpDir);

    expect(await action.getDescription())
        .toEqual(`Cut a new release for an active LTS branch (2 active).`);
  });

  it('should properly determine active and inactive LTS branches', async () => {
    const {releaseConfig} = getTestingMocksForReleaseAction();
    fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {
      'dist-tags': {
        'v9-lts': '9.2.3',
        'v8-lts': '8.4.4',
        'v7-lts': '7.0.1',
        'v6-lts': '6.0.0',
      },
      time: {
        '9.0.0': new Date().toISOString(),
        '8.0.0': new Date().toISOString(),
        // We pick dates for the v6 and v7 major versions that guarantee that the version
        // is no longer considered as active LTS version.
        '7.0.0': new Date(1912, 5, 23).toISOString(),
        '6.0.0': new Date(1912, 5, 23).toISOString(),
      },
    });

    // Note: This accesses a private method, so we need to use an element access to satisfy
    // TypeScript. It is acceptable to access the member for fine-grained unit testing due to
    // complexity with inquirer we want to avoid. It is not easy to test prompts.
    const {active, inactive} = await fetchLongTermSupportBranchesFromNpm(releaseConfig);

    expect(active).toEqual([
      {name: '9.2.x', version: matchesVersion('9.2.3'), npmDistTag: 'v9-lts'},
      {name: '8.4.x', version: matchesVersion('8.4.4'), npmDistTag: 'v8-lts'},
    ]);
    expect(inactive).toEqual([
      {name: '7.0.x', version: matchesVersion('7.0.1'), npmDistTag: 'v7-lts'},
      {name: '6.0.x', version: matchesVersion('6.0.0'), npmDistTag: 'v6-lts'},
    ]);
  });
});
