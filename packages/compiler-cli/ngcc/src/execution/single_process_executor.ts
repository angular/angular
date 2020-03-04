/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '../logging/logger';
import {PackageJsonUpdater} from '../writing/package_json_updater';

import {AnalyzeEntryPointsFn, CreateCompileFn, Executor} from './api';
import {AsyncLocker, SyncLocker} from './lock_file';
import {onTaskCompleted} from './utils';

export abstract class SingleProcessorExecutorBase {
  constructor(private logger: Logger, private pkgJsonUpdater: PackageJsonUpdater) {}

  doExecute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      void|Promise<void> {
    this.logger.debug(`Running ngcc on ${this.constructor.name}.`);

    const taskQueue = analyzeEntryPoints();
    const compile =
        createCompileFn((task, outcome) => onTaskCompleted(this.pkgJsonUpdater, task, outcome));

    // Process all tasks.
    this.logger.debug('Processing tasks...');
    const startTime = Date.now();

    while (!taskQueue.allTasksCompleted) {
      const task = taskQueue.getNextTask() !;
      compile(task);
      taskQueue.markTaskCompleted(task);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    this.logger.debug(`Processed tasks in ${duration}s.`);
  }
}

/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export class SingleProcessExecutorSync extends SingleProcessorExecutorBase implements Executor {
  constructor(logger: Logger, pkgJsonUpdater: PackageJsonUpdater, private lockFile: SyncLocker) {
    super(logger, pkgJsonUpdater);
  }
  execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void {
    this.lockFile.lock(() => this.doExecute(analyzeEntryPoints, createCompileFn));
  }
}

/**
 * An `Executor` that processes all tasks serially, but still completes asynchronously.
 */
export class SingleProcessExecutorAsync extends SingleProcessorExecutorBase implements Executor {
  constructor(logger: Logger, pkgJsonUpdater: PackageJsonUpdater, private lockFile: AsyncLocker) {
    super(logger, pkgJsonUpdater);
  }
  async execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      Promise<void> {
    await this.lockFile.lock(async() => this.doExecute(analyzeEntryPoints, createCompileFn));
  }
}
