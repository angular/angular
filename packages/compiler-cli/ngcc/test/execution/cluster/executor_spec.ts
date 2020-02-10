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
import {MockLockFile} from '../../helpers/mock_lock_file';
import {MockLogger} from '../../helpers/mock_logger';
import {mockProperty} from '../../helpers/spy_utils';


describe('ClusterExecutor', () => {
  const runAsClusterMaster = mockProperty(cluster, 'isMaster');
  let masterRunSpy: jasmine.Spy;
  let workerRunSpy: jasmine.Spy;
  let mockLogger: MockLogger;
  let mockLockFile: MockLockFile;
  let executor: ClusterExecutor;

  beforeEach(() => {
    masterRunSpy = spyOn(ClusterMaster.prototype, 'run')
                       .and.returnValue(Promise.resolve('CusterMaster#run()'));
    workerRunSpy = spyOn(ClusterWorker.prototype, 'run')
                       .and.returnValue(Promise.resolve('CusterWorker#run()'));

    mockLogger = new MockLogger();
    mockLockFile = new MockLockFile();
    executor =
        new ClusterExecutor(42, mockLogger, null as unknown as PackageJsonUpdater, mockLockFile);
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
        const analyzeEntryPointsSpy = jasmine.createSpy('analyzeEntryPoints');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');

        expect(await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy))
            .toBe('CusterMaster#run()' as any);

        expect(masterRunSpy).toHaveBeenCalledWith();
        expect(workerRunSpy).not.toHaveBeenCalled();

        expect(analyzeEntryPointsSpy).toHaveBeenCalledWith();
        expect(createCompilerFnSpy).not.toHaveBeenCalled();
      });

      it('should call LockFile.create() and LockFile.remove() if master runner completes successfully',
         async() => {
           const anyFn: () => any = () => undefined;
           await executor.execute(anyFn, anyFn);
           expect(mockLockFile.log).toEqual(['create()', 'remove()']);
         });

      it('should call LockFile.create() and LockFile.remove() if master runner fails', async() => {
        const anyFn: () => any = () => undefined;
        masterRunSpy.and.returnValue(Promise.reject(new Error('master runner error')));
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('master runner error');
        expect(mockLockFile.log).toEqual(['create()', 'remove()']);
      });

      it('should not call master runner if Lockfile.create() fails', async() => {
        const anyFn: () => any = () => undefined;
        const lockFile = new MockLockFile({throwOnCreate: true});
        executor =
            new ClusterExecutor(42, mockLogger, null as unknown as PackageJsonUpdater, lockFile);
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('LockFile.create() error');
        expect(lockFile.log).toEqual(['create()']);
        expect(masterRunSpy).not.toHaveBeenCalled();
      });

      it('should fail if Lockfile.remove() fails', async() => {
        const anyFn: () => any = () => undefined;
        const lockFile = new MockLockFile({throwOnRemove: true});
        executor =
            new ClusterExecutor(42, mockLogger, null as unknown as PackageJsonUpdater, lockFile);
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('LockFile.remove() error');
        expect(lockFile.log).toEqual(['create()', 'remove()']);
        expect(masterRunSpy).toHaveBeenCalled();
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
        const analyzeEntryPointsSpy = jasmine.createSpy('analyzeEntryPoints');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');

        expect(await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy))
            .toBe('CusterWorker#run()' as any);

        expect(masterRunSpy).not.toHaveBeenCalledWith();
        expect(workerRunSpy).toHaveBeenCalled();

        expect(analyzeEntryPointsSpy).not.toHaveBeenCalled();
        expect(createCompilerFnSpy).toHaveBeenCalledWith(jasmine.any(Function));
      });

      it('should not call LockFile.create() or LockFile.remove()', async() => {
        const anyFn: () => any = () => undefined;
        await executor.execute(anyFn, anyFn);
        expect(mockLockFile.log).toEqual([]);
      });
    });
  });
});
