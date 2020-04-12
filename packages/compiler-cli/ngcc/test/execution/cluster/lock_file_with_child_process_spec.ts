/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {ChildProcess} from 'child_process';
import * as cluster from 'cluster';

import {getFileSystem} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {ClusterLockFileWithChildProcess} from '../../../src/execution/cluster/lock_file_with_child_process';
import {LockFileWithChildProcess} from '../../../src/locking/lock_file_with_child_process';
import {MockLogger} from '../../helpers/mock_logger';
import {mockProperty} from '../../helpers/spy_utils';


runInEachFileSystem(() => {
  describe('ClusterLockFileWithChildProcess', () => {
    const runAsClusterMaster = mockProperty(cluster, 'isMaster');
    const mockUnlockerProcess = {} as ChildProcess;
    let lockFileWithChildProcessSpies:
        Record<'createUnlocker'|'read'|'remove'|'write', jasmine.Spy>;

    beforeEach(() => {
      lockFileWithChildProcessSpies = {
        createUnlocker: spyOn(LockFileWithChildProcess.prototype as any, 'createUnlocker')
                            .and.returnValue(mockUnlockerProcess),
        read: spyOn(LockFileWithChildProcess.prototype, 'read').and.returnValue('{unknown}'),
        remove: spyOn(LockFileWithChildProcess.prototype, 'remove'),
        write: spyOn(LockFileWithChildProcess.prototype, 'write'),
      };
    });

    it('should be an instance of `LockFileWithChildProcess`', () => {
      const lockFile = new ClusterLockFileWithChildProcess(getFileSystem(), new MockLogger());

      expect(lockFile).toEqual(jasmine.any(ClusterLockFileWithChildProcess));
      expect(lockFile).toEqual(jasmine.any(LockFileWithChildProcess));
    });

    describe('write()', () => {
      it('should create the lock-file when called on the cluster master', () => {
        runAsClusterMaster(true);
        const lockFile = new ClusterLockFileWithChildProcess(getFileSystem(), new MockLogger());

        expect(lockFileWithChildProcessSpies.write).not.toHaveBeenCalled();

        lockFile.write();
        expect(lockFileWithChildProcessSpies.write).toHaveBeenCalledWith();
      });

      it('should throw an error when called on a cluster worker', () => {
        runAsClusterMaster(false);
        const lockFile = new ClusterLockFileWithChildProcess(getFileSystem(), new MockLogger());

        expect(() => lockFile.write())
            .toThrowError('Tried to create a lock-file from a worker process.');
        expect(lockFileWithChildProcessSpies.write).not.toHaveBeenCalled();
      });
    });

    describe('createUnlocker()', () => {
      it('should create the unlocker when called on the cluster master', () => {
        runAsClusterMaster(true);
        const lockFile = new ClusterLockFileWithChildProcess(getFileSystem(), new MockLogger());

        lockFileWithChildProcessSpies.createUnlocker.calls.reset();

        expect((lockFile as any).createUnlocker(lockFile.path)).toBe(mockUnlockerProcess);
        expect(lockFileWithChildProcessSpies.createUnlocker).toHaveBeenCalledWith(lockFile.path);
      });

      it('should not create the unlocker when called on a cluster worker', () => {
        runAsClusterMaster(false);
        const lockFile = new ClusterLockFileWithChildProcess(getFileSystem(), new MockLogger());

        expect((lockFile as any).createUnlocker(lockFile.path)).toBeNull();
        expect(lockFileWithChildProcessSpies.createUnlocker).not.toHaveBeenCalled();
      });
    });
  });
});
