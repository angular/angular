/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {SingleProcessExecutorSync} from '../../src/execution/single_process_executor';
import {SerialTaskQueue} from '../../src/execution/task_selection/serial_task_queue';
import {PackageJsonUpdater} from '../../src/writing/package_json_updater';
import {MockLockFileSync} from '../helpers/mock_lock_file';
import {MockLogger} from '../helpers/mock_logger';


describe('SingleProcessExecutor', () => {
  let mockLogger: MockLogger;
  let mockLockFile: MockLockFileSync;
  let executor: SingleProcessExecutorSync;

  beforeEach(() => {
    mockLogger = new MockLogger();
    mockLockFile = new MockLockFileSync();
    executor = new SingleProcessExecutorSync(
        mockLogger, null as unknown as PackageJsonUpdater, mockLockFile);
  });

  describe('execute()', () => {
    it('should call LockFile.create() and LockFile.remove() if processing completes successfully',
       () => {
         const noTasks = () => new SerialTaskQueue([] as any);
         const createCompileFn: () => any = () => undefined;
         executor.execute(noTasks, createCompileFn);
         expect(mockLockFile.log).toEqual(['create()', 'remove()']);
       });

    it('should call LockFile.create() and LockFile.remove() if `analyzeEntryPoints` fails', () => {
      const errorFn: () => never = () => { throw new Error('analyze error'); };
      const createCompileFn: () => any = () => undefined;
      let error: string = '';
      try {
        executor.execute(errorFn, createCompileFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('analyze error');
      expect(mockLockFile.log).toEqual(['create()', 'remove()']);
    });

    it('should call LockFile.create() and LockFile.remove() if `createCompileFn` fails', () => {
      const oneTask = () => new SerialTaskQueue([{}] as any);
      const createErrorCompileFn: () => any = () => { throw new Error('compile error'); };
      let error: string = '';
      try {
        executor.execute(oneTask, createErrorCompileFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('compile error');
      expect(mockLockFile.log).toEqual(['create()', 'remove()']);
    });

    it('should not call `analyzeEntryPoints` if Lockfile.create() fails', () => {
      const lockFile = new MockLockFileSync({throwOnCreate: true});
      const analyzeFn: () => any = () => { lockFile.log.push('analyzeFn'); };
      const anyFn: () => any = () => undefined;
      executor = new SingleProcessExecutorSync(
          mockLogger, null as unknown as PackageJsonUpdater, lockFile);
      let error = '';
      try {
        executor.execute(analyzeFn, anyFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('LockFile.create() error');
      expect(lockFile.log).toEqual(['create()']);
    });

    it('should fail if Lockfile.remove() fails', () => {
      const noTasks = () => new SerialTaskQueue([] as any);
      const anyFn: () => any = () => undefined;
      const lockFile = new MockLockFileSync({throwOnRemove: true});
      executor = new SingleProcessExecutorSync(
          mockLogger, null as unknown as PackageJsonUpdater, lockFile);
      let error = '';
      try {
        executor.execute(noTasks, anyFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('LockFile.remove() error');
      expect(lockFile.log).toEqual(['create()', 'remove()']);
    });
  });
});
