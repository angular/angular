/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {Logger} from '../../logging/logger';
import {PackageJsonUpdater} from '../../writing/package_json_updater';
import {AnalyzeEntryPointsFn, CreateCompileFn, Executor} from '../api';

import {ClusterMaster} from './master';
import {ClusterWorker} from './worker';


/**
 * An `Executor` that processes tasks in parallel (on multiple processes) and completes
 * asynchronously.
 */
export class ClusterExecutor implements Executor {
  constructor(
      private workerCount: number, private logger: Logger,
      private pkgJsonUpdater: PackageJsonUpdater) {}

  async execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      Promise<void> {
    if (cluster.isMaster) {
      this.logger.debug(
          `Running ngcc on ${this.constructor.name} (using ${this.workerCount} worker processes).`);

      // This process is the cluster master.
      const master =
          new ClusterMaster(this.workerCount, this.logger, this.pkgJsonUpdater, analyzeEntryPoints);
      return master.run();
    } else {
      // This process is a cluster worker.
      const worker = new ClusterWorker(createCompileFn);
      return worker.run();
    }
  }
}
