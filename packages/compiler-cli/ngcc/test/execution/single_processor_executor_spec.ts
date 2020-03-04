/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {SyncLocker} from '../../src/execution/lock_file';
import {SingleProcessExecutorSync} from '../../src/execution/single_process_executor';
import {SerialTaskQueue} from '../../src/execution/task_selection/serial_task_queue';
import {PackageJsonUpdater} from '../../src/writing/package_json_updater';
import {MockLockFile} from '../helpers/mock_lock_file';
import {MockLogger} from '../helpers/mock_logger';


describe('SingleProcessExecutor', () => {
  let mockLogger: MockLogger;
  let lockFileLog: string[];
  let mockLockFile: MockLockFile;
  let locker: SyncLocker;
  let executor: SingleProcessExecutorSync;

  beforeEach(() => {
    mockLogger = new MockLogger();
    lockFileLog = [];
    mockLockFile = new MockLockFile(new MockFileSystemNative(), lockFileLog);
    locker = new SyncLocker(mockLockFile);
    executor =
        new SingleProcessExecutorSync(mockLogger, null as unknown as PackageJsonUpdater, locker);
  });

  describe('execute()', () => {
    it('should call LockFile.write() and LockFile.remove() if processing completes successfully',
       () => {
         const noTasks = () => new SerialTaskQueue([] as any);
         const createCompileFn: () => any = () => undefined;
         executor.execute(noTasks, createCompileFn);
         expect(lockFileLog).toEqual(['write()', 'remove()']);
       });

    it('should call LockFile.write() and LockFile.remove() if `analyzeEntryPoints` fails', () => {
      const errorFn: () => never = () => { throw new Error('analyze error'); };
      const createCompileFn: () => any = () => undefined;
      let error: string = '';
      try {
        executor.execute(errorFn, createCompileFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('analyze error');
      expect(lockFileLog).toEqual(['write()', 'remove()']);
    });

    it('should call LockFile.write() and LockFile.remove() if `createCompileFn` fails', () => {
      const oneTask = () => new SerialTaskQueue([{}] as any);
      const createErrorCompileFn: () => any = () => { throw new Error('compile error'); };
      let error: string = '';
      try {
        executor.execute(oneTask, createErrorCompileFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('compile error');
      expect(lockFileLog).toEqual(['write()', 'remove()']);
    });

    it('should not call `analyzeEntryPoints` if LockFile.write() fails', () => {
      spyOn(mockLockFile, 'write').and.callFake(() => {
        lockFileLog.push('write()');
        throw new Error('LockFile.write() error');
      });

      const analyzeFn: () => any = () => { lockFileLog.push('analyzeFn'); };
      const anyFn: () => any = () => undefined;
      executor =
          new SingleProcessExecutorSync(mockLogger, null as unknown as PackageJsonUpdater, locker);
      let error = '';
      try {
        executor.execute(analyzeFn, anyFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('LockFile.write() error');
      expect(lockFileLog).toEqual(['write()']);
    });

    it('should fail if LockFile.remove() fails', () => {
      const noTasks = () => new SerialTaskQueue([] as any);
      const anyFn: () => any = () => undefined;
      spyOn(mockLockFile, 'remove').and.callFake(() => {
        lockFileLog.push('remove()');
        throw new Error('LockFile.remove() error');
      });

      executor =
          new SingleProcessExecutorSync(mockLogger, null as unknown as PackageJsonUpdater, locker);
      let error = '';
      try {
        executor.execute(noTasks, anyFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('LockFile.remove() error');
      expect(lockFileLog).toEqual(['write()', 'remove()']);
    });
  });
});
