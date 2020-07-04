/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {JsonObject} from '../../packages/entry_point';
import {applyChange, PackageJsonChange, PackageJsonUpdate, PackageJsonUpdater} from '../../writing/package_json_updater';

import {sendMessageToMaster} from './utils';


/**
 * A `PackageJsonUpdater` for cluster workers that will send update changes to the master process so
 * that it can safely handle update operations on multiple processes.
 */
export class ClusterWorkerPackageJsonUpdater implements PackageJsonUpdater {
  constructor() {
    if (cluster.isMaster) {
      throw new Error('Tried to create cluster worker PackageJsonUpdater on the master process.');
    }
  }

  createUpdate(): PackageJsonUpdate {
    return new PackageJsonUpdate((...args) => this.writeChanges(...args));
  }

  /**
   * Apply the changes in-memory (if necessary) and send a message to the master process.
   */
  writeChanges(
      changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath,
      preExistingParsedJson?: JsonObject): void {
    if (preExistingParsedJson) {
      for (const [propPath, value] of changes) {
        if (propPath.length === 0) {
          throw new Error(`Missing property path for writing value to '${packageJsonPath}'.`);
        }

        // No need to take property positioning into account for in-memory representations.
        applyChange(preExistingParsedJson, propPath, value, 'unimportant');
      }
    }

    sendMessageToMaster({
      type: 'update-package-json',
      packageJsonPath,
      changes,
    });
  }
}
