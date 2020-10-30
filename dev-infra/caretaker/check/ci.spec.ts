
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SemVer} from 'semver';

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

  describe('gets data for active trains', () => {
    it('handles active rc train', async () => {
      const trains = buildMockActiveReleaseTrains(true);
      fetchActiveReleaseTrainsSpy.and.returnValue(Promise.resolve(trains));
      // Await the module, to allow the retrieveData method to call `resolve`.
      await new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.releaseCandidate!.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
    });

    it('handles an inactive rc train', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.returnValue(Promise.resolve(trains));
      // Await the module, to allow the retrieveData method to call `resolve`.
      await new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
    });

    it('aggregates information into a useful structure', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.returnValue(Promise.resolve(trains));
      getBranchStatusFromCiSpy.and.returnValue('success');
      // Await the module, to allow the retrieveData method to call `resolve`.
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
    const trains = buildMockActiveReleaseTrains(false);
    fetchActiveReleaseTrainsSpy.and.returnValue(Promise.resolve(trains));
    getBranchStatusFromCiSpy.and.returnValues('success', 'failed');

    // Await the module, to allow the retrieveData method to call `resolve`.
    const module = new CiModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
    Object.defineProperty(module, 'data', {value: fakeData});

    await module.printToTerminal();

    expect(debugSpy).toHaveBeenCalledWith('No active release train for name1');
    expect(infoSpy).toHaveBeenCalledWith('label0 ✅');
  });
});


/** Build a mock set of ActiveResultTrains.  */
function buildMockActiveReleaseTrains(withRc: boolean) {
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
