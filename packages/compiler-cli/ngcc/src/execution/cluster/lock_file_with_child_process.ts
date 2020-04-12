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

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {LockFileWithChildProcess} from '../../locking/lock_file_with_child_process';


/**
 * A `LockFileWithChildProcess` that is `cluster`-aware and does not spawn unlocker processes from
 * worker processes (only from the master process, which does the locking).
 */
export class ClusterLockFileWithChildProcess extends LockFileWithChildProcess {
  write(): void {
    if (!cluster.isMaster) {
      // This is a worker process:
      // This method should only be on the master process.
      throw new Error('Tried to create a lock-file from a worker process.');
    }

    return super.write();
  }

  protected createUnlocker(path: AbsoluteFsPath): ChildProcess|null {
    if (cluster.isMaster) {
      // This is the master process:
      // Create the unlocker.
      return super.createUnlocker(path);
    }

    return null;
  }
}
