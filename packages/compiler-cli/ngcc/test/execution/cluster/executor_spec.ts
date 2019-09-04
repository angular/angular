/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {ClusterExecutor} from '../../../src/execution/cluster/executor';
import {ClusterMaster} from '../../../src/execution/cluster/master';
import {ClusterWorker} from '../../../src/execution/cluster/worker';
import {PackageJsonUpdater} from '../../../src/writing/package_json_updater';
import {MockLogger} from '../../helpers/mock_logger';
import {mockProperty} from '../../helpers/spy_utils';


describe('ClusterExecutor', () => {
  const runAsClusterMaster = mockProperty(cluster, 'isMaster');
  let masterRunSpy: jasmine.Spy;
  let workerRunSpy: jasmine.Spy;
  let mockLogger: MockLogger;
  let executor: ClusterExecutor;

  beforeEach(() => {
    masterRunSpy = spyOn(ClusterMaster.prototype, 'run');
    workerRunSpy = spyOn(ClusterWorker.prototype, 'run');

    mockLogger = new MockLogger();
    executor = new ClusterExecutor(42, mockLogger, null as unknown as PackageJsonUpdater);
  });

  describe('execute()', () => {
    describe('(on cluster master)', () => {
      beforeEach(() => runAsClusterMaster(true));

      it('should log debug info about the executor', () => {
        const anyFn: () => any = () => undefined;
        executor.execute(anyFn, anyFn);

        expect(mockLogger.logs.debug).toEqual([
          ['Running ngcc on ClusterExecutor (using 42 worker processes).'],
        ]);
      });

      it('should delegate to `ClusterMaster#run()`', async() => {
        masterRunSpy.and.returnValue('CusterMaster#run()');
        const analyzeEntryPointsSpy = jasmine.createSpy('analyzeEntryPoints');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');

        expect(await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy))
            .toBe('CusterMaster#run()' as any);

        expect(masterRunSpy).toHaveBeenCalledWith();
        expect(workerRunSpy).not.toHaveBeenCalled();

        expect(analyzeEntryPointsSpy).toHaveBeenCalledWith();
        expect(createCompilerFnSpy).not.toHaveBeenCalled();
      });
    });

    describe('(on cluster worker)', () => {
      beforeEach(() => runAsClusterMaster(false));

      it('should not log debug info about the executor', () => {
        const anyFn: () => any = () => undefined;
        executor.execute(anyFn, anyFn);

        expect(mockLogger.logs.debug).toEqual([]);
      });

      it('should delegate to `ClusterWorker#run()`', async() => {
        workerRunSpy.and.returnValue('CusterWorker#run()');
        const analyzeEntryPointsSpy = jasmine.createSpy('analyzeEntryPoints');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');

        expect(await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy))
            .toBe('CusterWorker#run()' as any);

        expect(masterRunSpy).not.toHaveBeenCalledWith();
        expect(workerRunSpy).toHaveBeenCalled();

        expect(analyzeEntryPointsSpy).not.toHaveBeenCalled();
        expect(createCompilerFnSpy).toHaveBeenCalledWith(jasmine.any(Function));
      });
    });
  });
});
