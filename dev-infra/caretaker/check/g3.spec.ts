
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SpawnSyncReturns} from 'child_process';

import * as console from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing';

import {G3Module, G3StatsData} from './g3';

describe('G3Module', () => {
  let getG3FileIncludeAndExcludeLists: jasmine.Spy;
  let getLatestShas: jasmine.Spy;
  let getDiffStats: jasmine.Spy;
  let infoSpy: jasmine.Spy;

  beforeEach(() => {
    installVirtualGitClientSpies();
    getG3FileIncludeAndExcludeLists =
        spyOn(G3Module.prototype, 'getG3FileIncludeAndExcludeLists' as any).and.returnValue(null);
    getLatestShas = spyOn(G3Module.prototype, 'getLatestShas' as any).and.returnValue(null);
    getDiffStats = spyOn(G3Module.prototype, 'getDiffStats' as any).and.returnValue(null);
    infoSpy = spyOn(console, 'info');
  });

  describe('gathering stats', () => {
    it('unless the g3 merge config is not defined in the angular robot file', async () => {
      getG3FileIncludeAndExcludeLists.and.returnValue(null);
      getLatestShas.and.returnValue({g3: 'abc123', master: 'zxy987'});
      const module = new G3Module({caretaker: {}, ...mockNgDevConfig});

      expect(getDiffStats).not.toHaveBeenCalled();
      expect(await module.data).toBe(undefined);
    });

    it('unless the branch shas are not able to be retrieved', async () => {
      getLatestShas.and.returnValue(null);
      getG3FileIncludeAndExcludeLists.and.returnValue({include: ['file1'], exclude: []});
      const module = new G3Module({caretaker: {}, ...mockNgDevConfig});

      expect(getDiffStats).not.toHaveBeenCalled();
      expect(await module.data).toBe(undefined);
    });

    it('for the files which are being synced to g3', async () => {
      getLatestShas.and.returnValue({g3: 'abc123', master: 'zxy987'});
      getG3FileIncludeAndExcludeLists.and.returnValue({include: ['project1/*'], exclude: []});
      getDiffStats.and.callThrough();
      spyOn(GitClient.prototype, 'run').and.callFake((args: string[]): any => {
        const output: Partial<SpawnSyncReturns<string>> = {};
        if (args[0] === 'rev-list') {
          output.stdout = '3';
        }
        if (args[0] === 'diff') {
          output.stdout = '5\t6\tproject1/file1\n2\t3\tproject2/file2\n7\t1\tproject1/file3\n';
        }
        return output;
      });

      const module = new G3Module({caretaker: {}, ...mockNgDevConfig});
      const {insertions, deletions, files, commits} = (await module.data) as G3StatsData;

      expect(insertions).toBe(12);
      expect(deletions).toBe(7);
      expect(files).toBe(2);
      expect(commits).toBe(3);
    });
  });

  describe('printing the data retrieved', () => {
    it('if files are discovered needing to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 25,
        deletions: 10,
        files: 2,
        commits: 2,
      });

      const module = new G3Module({caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith(
          '2 files changed, 25 insertions(+), 10 deletions(-) from 2 commits will be included in the next sync');
    });

    it('if no files need to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 0,
        deletions: 0,
        files: 0,
        commits: 25,
      });

      const module = new G3Module({caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith('25 commits between g3 and master');
      expect(infoSpy).toHaveBeenCalledWith('✅  No sync is needed at this time');
    });
  });
});
