
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SemVer} from 'semver';
import {ReleaseTrain} from '../../release/versioning';

import * as versioning from '../../release/versioning/active-release-trains';
import * as console from '../../utils/console';
import {buildVirtualGitClient, mockNgDevConfig, VirtualGitClient} from '../../utils/testing';

import {CiModule} from './ci';

describe('CiModule', () => {
  let fetchActiveReleaseTrainsSpy: jasmine.Spy;
  let getBranchStatusFromCiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let debugSpy: jasmine.Spy;
  let virtualGitClient: VirtualGitClient;

  beforeEach(() => {
    virtualGitClient = buildVirtualGitClient();
    fetchActiveReleaseTrainsSpy = spyOn(versioning, 'fetchActiveReleaseTrains');
    getBranchStatusFromCiSpy = spyOn(CiModule.prototype, 'getBranchStatusFromCi' as any);
    infoSpy = spyOn(console, 'info');
    debugSpy = spyOn(console, 'debug');
  });

  describe('getting data for active trains', () => {
    it('handles active rc train', async () => {
      const trains = buildMockActiveReleaseTrains(true);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.releaseCandidate.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledTimes(3);
    });

    it('handles an inactive rc train', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledTimes(2);
    });

    it('aggregates information into a useful structure', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      getBranchStatusFromCiSpy.and.returnValue('success');
      const module = new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
      const data = await module.data;

      expect(data[0]).toEqual(
          {active: false, name: 'releaseCandidate', label: '', status: 'not found'});
      expect(data[1]).toEqual({
        active: true,
        name: 'latest-branch',
        label: 'latest (latest-branch)',
        status: 'success',
      });
    });
  });

  it('prints the data retrieved', async () => {
    const fakeData = Promise.resolve([
      {
        active: true,
        name: 'name0',
        label: 'label0',
        status: 'success',
      },
      {
        active: false,
        name: 'name1',
        label: 'label1',
        status: 'failed',
      },
    ]);
    fetchActiveReleaseTrainsSpy.and.resolveTo([]);

    const module = new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
    Object.defineProperty(module, 'data', {value: fakeData});

    await module.printToTerminal();

    expect(debugSpy).toHaveBeenCalledWith('No active release train for name1');
    expect(infoSpy).toHaveBeenCalledWith('label0 ✅');
  });
});


/** Build a mock set of ActiveReleaseTrains. */
function buildMockActiveReleaseTrains(withRc: false): versioning.ActiveReleaseTrains&
    {releaseCandidate: null};
function buildMockActiveReleaseTrains(withRc: true): versioning.ActiveReleaseTrains&
    {releaseCandidate: ReleaseTrain};
function buildMockActiveReleaseTrains(withRc: boolean): versioning.ActiveReleaseTrains {
  const baseResult = {
    isMajor: false,
    version: new SemVer('0.0.0'),
  };
  return {
    releaseCandidate: withRc ? {branchName: 'rc-branch', ...baseResult} : null,
    latest: {branchName: 'latest-branch', ...baseResult},
    next: {branchName: 'next-branch', ...baseResult}
  };
}
