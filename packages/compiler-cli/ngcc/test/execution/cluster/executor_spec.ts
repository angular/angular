/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import * as cluster from 'cluster';

import {MockFileSystemNative, runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../../src/ngtsc/logging/testing';
import {ClusterExecutor} from '../../../src/execution/cluster/executor';
import {ClusterMaster} from '../../../src/execution/cluster/master';
import {AsyncLocker} from '../../../src/locking/async_locker';
import {FileWriter} from '../../../src/writing/file_writer';
import {PackageJsonUpdater} from '../../../src/writing/package_json_updater';
import {MockLockFile} from '../../helpers/mock_lock_file';
import {mockProperty} from '../../helpers/spy_utils';

runInEachFileSystem(() => {
  describe('ClusterExecutor', () => {
    const runAsClusterMaster = mockProperty(cluster, 'isMaster');
    let masterRunSpy: jasmine.Spy;
    let mockLogger: MockLogger;
    let lockFileLog: string[];
    let mockLockFile: MockLockFile;
    let locker: AsyncLocker;
    let executor: ClusterExecutor;
    let createTaskCompletedCallback: jasmine.Spy;

    beforeEach(() => {
      masterRunSpy = spyOn(ClusterMaster.prototype, 'run')
                         .and.returnValue(Promise.resolve('ClusterMaster#run()' as any));
      createTaskCompletedCallback = jasmine.createSpy('createTaskCompletedCallback');

      mockLogger = new MockLogger();
      lockFileLog = [];
      mockLockFile = new MockLockFile(new MockFileSystemNative(), lockFileLog);
      locker = new AsyncLocker(mockLockFile, mockLogger, 200, 2);
      executor = new ClusterExecutor(
          42, getFileSystem(), mockLogger, null as unknown as FileWriter,
          null as unknown as PackageJsonUpdater, locker, createTaskCompletedCallback);
    });

    describe('execute()', () => {
      beforeEach(() => runAsClusterMaster(true));

      it('should log debug info about the executor', async () => {
        const anyFn: () => any = () => undefined;
        await executor.execute(anyFn, anyFn);

        expect(mockLogger.logs.debug).toEqual([
          ['Running ngcc on ClusterExecutor (using 42 worker processes).'],
        ]);
      });

      it('should delegate to `ClusterMaster#run()`', async () => {
        const analyzeEntryPointsSpy = jasmine.createSpy('analyzeEntryPoints');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');

        expect(await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy))
            .toBe('ClusterMaster#run()' as any);

        expect(masterRunSpy).toHaveBeenCalledWith();

        expect(analyzeEntryPointsSpy).toHaveBeenCalledWith();
        expect(createCompilerFnSpy).not.toHaveBeenCalled();
      });

      it('should call LockFile.write() and LockFile.remove() if master runner completes successfully',
         async () => {
           const anyFn: () => any = () => undefined;
           await executor.execute(anyFn, anyFn);
           expect(lockFileLog).toEqual(['write()', 'remove()']);
         });

      it('should call LockFile.write() and LockFile.remove() if analyzeFn fails', async () => {
        const analyzeEntryPointsSpy =
            jasmine.createSpy('analyzeEntryPoints').and.throwError('analyze error');
        const createCompilerFnSpy = jasmine.createSpy('createCompilerFn');
        let error = '';
        try {
          await executor.execute(analyzeEntryPointsSpy, createCompilerFnSpy);
        } catch (e) {
          error = e.message;
        }
        expect(analyzeEntryPointsSpy).toHaveBeenCalledWith();
        expect(createCompilerFnSpy).not.toHaveBeenCalled();
        expect(error).toEqual('analyze error');
        expect(lockFileLog).toEqual(['write()', 'remove()']);
      });

      it('should call LockFile.write() and LockFile.remove() if master runner fails', async () => {
        const anyFn: () => any = () => undefined;
        masterRunSpy.and.returnValue(Promise.reject(new Error('master runner error')));
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('master runner error');
        expect(lockFileLog).toEqual(['write()', 'remove()']);
      });

      it('should not call master runner if LockFile.write() fails', async () => {
        const anyFn: () => any = () => undefined;
        spyOn(mockLockFile, 'write').and.callFake(() => {
          lockFileLog.push('write()');
          throw new Error('LockFile.write() error');
        });

        executor = new ClusterExecutor(
            42, getFileSystem(), mockLogger, null as unknown as FileWriter,
            null as unknown as PackageJsonUpdater, locker, createTaskCompletedCallback);
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('LockFile.write() error');
        expect(masterRunSpy).not.toHaveBeenCalled();
      });

      it('should fail if LockFile.remove() fails', async () => {
        const anyFn: () => any = () => undefined;
        spyOn(mockLockFile, 'remove').and.callFake(() => {
          lockFileLog.push('remove()');
          throw new Error('LockFile.remove() error');
        });

        executor = new ClusterExecutor(
            42, getFileSystem(), mockLogger, null as unknown as FileWriter,
            null as unknown as PackageJsonUpdater, locker, createTaskCompletedCallback);
        let error = '';
        try {
          await executor.execute(anyFn, anyFn);
        } catch (e) {
          error = e.message;
        }
        expect(error).toEqual('LockFile.remove() error');
        expect(lockFileLog).toEqual(['write()', 'remove()']);
        expect(masterRunSpy).toHaveBeenCalled();
      });
    });
  });
});
