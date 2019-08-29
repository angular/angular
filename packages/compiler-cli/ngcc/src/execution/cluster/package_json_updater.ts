/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {JsonObject} from '../../packages/entry_point';
import {PackageJsonChange, PackageJsonUpdate, PackageJsonUpdater, applyChange} from '../../writing/package_json_updater';

import {sendMessageToMaster} from './utils';


/**
 * A `PackageJsonUpdater` that can safely handle update operations on multiple processes.
 */
export class ClusterPackageJsonUpdater implements PackageJsonUpdater {
  constructor(private delegate: PackageJsonUpdater) {}

  createUpdate(): PackageJsonUpdate {
    return new PackageJsonUpdate((...args) => this.writeChanges(...args));
  }

  writeChanges(
      changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath,
      preExistingParsedJson?: JsonObject): void {
    if (cluster.isMaster) {
      // This is the master process:
      // Actually apply the changes to the file on disk.
      return this.delegate.writeChanges(changes, packageJsonPath, preExistingParsedJson);
    }

    // This is a worker process:
    // Apply the changes in-memory (if necessary) and send a message to the master process.
    if (preExistingParsedJson) {
      for (const [propPath, value] of changes) {
        if (propPath.length === 0) {
          throw new Error(`Missing property path for writing value to '${packageJsonPath}'.`);
        }

        applyChange(preExistingParsedJson, propPath, value);
      }
    }

    sendMessageToMaster({
      type: 'update-package-json',
      packageJsonPath,
      changes,
    });
  }
}
