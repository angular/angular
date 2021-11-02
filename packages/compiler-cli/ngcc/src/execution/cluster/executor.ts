/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathManipulation} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';
import {AsyncLocker} from '../../locking/async_locker';
import {FileWriter} from '../../writing/file_writer';
import {PackageJsonUpdater} from '../../writing/package_json_updater';
import {AnalyzeEntryPointsFn, CreateCompileFn, Executor} from '../api';
import {CreateTaskCompletedCallback} from '../tasks/api';

import {ClusterMaster} from './master';

/**
 * An `Executor` that processes tasks in parallel (on multiple processes) and completes
 * asynchronously.
 */
export class ClusterExecutor implements Executor {
  constructor(
      private workerCount: number, private fileSystem: PathManipulation, private logger: Logger,
      private fileWriter: FileWriter, private pkgJsonUpdater: PackageJsonUpdater,
      private lockFile: AsyncLocker,
      private createTaskCompletedCallback: CreateTaskCompletedCallback) {}

  async execute(analyzeEntryPoints: AnalyzeEntryPointsFn, _createCompileFn: CreateCompileFn):
      Promise<void> {
    return this.lockFile.lock(async () => {
      this.logger.debug(
          `Running ngcc on ${this.constructor.name} (using ${this.workerCount} worker processes).`);
      const master = new ClusterMaster(
          this.workerCount, this.fileSystem, this.logger, this.fileWriter, this.pkgJsonUpdater,
          analyzeEntryPoints, this.createTaskCompletedCallback);
      return await master.run();
    });
  }
}
