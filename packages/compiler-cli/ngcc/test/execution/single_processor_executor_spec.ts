/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {SingleProcessExecutorSync} from '../../src/execution/single_process_executor';
import {Task, TaskQueue} from '../../src/execution/tasks/api';
import {SyncLocker} from '../../src/locking/sync_locker';
import {MockLockFile} from '../helpers/mock_lock_file';


describe('SingleProcessExecutor', () => {
  let mockLogger: MockLogger;
  let lockFileLog: string[];
  let mockLockFile: MockLockFile;
  let locker: SyncLocker;
  let executor: SingleProcessExecutorSync;
  let createTaskCompletedCallback: jasmine.Spy;

  beforeEach(() => {
    mockLogger = new MockLogger();
    lockFileLog = [];
    mockLockFile = new MockLockFile(new MockFileSystemNative(), lockFileLog);
    locker = new SyncLocker(mockLockFile);
    createTaskCompletedCallback = jasmine.createSpy('createTaskCompletedCallback');
    executor = new SingleProcessExecutorSync(mockLogger, locker, createTaskCompletedCallback);
  });

  const noTasks = () => ({allTasksCompleted: true, getNextTask: () => null} as TaskQueue);
  const oneTask = () => {
    let tasksCount = 1;
    return <TaskQueue>{
      get allTasksCompleted() {
        return tasksCount === 0;
      },
      getNextTask() {
        tasksCount--;
        return {};
      },
      markAsCompleted(_task: Task) {},
    };
  };

  describe('execute()', () => {
    it('should call LockFile.write() and LockFile.remove() if processing completes successfully',
       () => {
         const createCompileFn: () => any = () => undefined;
         executor.execute(noTasks, createCompileFn);
         expect(lockFileLog).toEqual(['write()', 'remove()']);
       });

    it('should call LockFile.write() and LockFile.remove() if `analyzeEntryPoints` fails', () => {
      const errorFn: () => never = () => {
        throw new Error('analyze error');
      };
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
      const createErrorCompileFn: () => any = () => {
        throw new Error('compile error');
      };
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

      const analyzeFn: () => any = () => {
        lockFileLog.push('analyzeFn');
      };
      const anyFn: () => any = () => undefined;
      executor = new SingleProcessExecutorSync(mockLogger, locker, createTaskCompletedCallback);
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
      const anyFn: () => any = () => undefined;
      spyOn(mockLockFile, 'remove').and.callFake(() => {
        lockFileLog.push('remove()');
        throw new Error('LockFile.remove() error');
      });

      executor = new SingleProcessExecutorSync(mockLogger, locker, createTaskCompletedCallback);
      let error = '';
      try {
        executor.execute(noTasks, anyFn);
      } catch (e) {
        error = e.message;
      }
      expect(error).toEqual('LockFile.remove() error');
      expect(lockFileLog).toEqual(['write()', 'remove()']);
    });

    it('should call createTaskCompletedCallback with the task queue', () => {
      const createCompileFn = jasmine.createSpy('createCompileFn');
      executor.execute(noTasks, createCompileFn);
      expect(createTaskCompletedCallback).toHaveBeenCalledTimes(1);
      expect(createTaskCompletedCallback.calls.mostRecent().args).toEqual([jasmine.objectContaining(
          {allTasksCompleted: true, getNextTask: jasmine.any(Function)})]);
    });

    it('should pass the necessary callbacks to createCompileFn', () => {
      const beforeWritingFiles = jasmine.any(Function);
      const onTaskCompleted = () => {};
      const createCompileFn =
          jasmine.createSpy('createCompileFn').and.returnValue(function compileFn() {});
      createTaskCompletedCallback.and.returnValue(onTaskCompleted);
      executor.execute(noTasks, createCompileFn);
      expect(createCompileFn).toHaveBeenCalledTimes(1);
      expect(createCompileFn).toHaveBeenCalledWith(beforeWritingFiles, onTaskCompleted);
    });
  });
});
