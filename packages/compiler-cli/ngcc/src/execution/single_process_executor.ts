/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '../../../src/ngtsc/logging';
import {AsyncLocker} from '../locking/async_locker';
import {SyncLocker} from '../locking/sync_locker';

import {AnalyzeEntryPointsFn, CreateCompileFn, Executor} from './api';
import {CreateTaskCompletedCallback} from './tasks/api';

export abstract class SingleProcessorExecutorBase {
  constructor(
      private logger: Logger, private createTaskCompletedCallback: CreateTaskCompletedCallback) {}

  doExecute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      void|Promise<void> {
    this.logger.debug(`Running ngcc on ${this.constructor.name}.`);

    const taskQueue = analyzeEntryPoints();
    const onTaskCompleted = this.createTaskCompletedCallback(taskQueue);
    const compile = createCompileFn(() => {}, onTaskCompleted);

    // Process all tasks.
    this.logger.debug('Processing tasks...');
    const startTime = Date.now();

    while (!taskQueue.allTasksCompleted) {
      const task = taskQueue.getNextTask()!;
      compile(task);
      taskQueue.markAsCompleted(task);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    this.logger.debug(`Processed tasks in ${duration}s.`);
  }
}

/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export class SingleProcessExecutorSync extends SingleProcessorExecutorBase implements Executor {
  constructor(
      logger: Logger, private lockFile: SyncLocker,
      createTaskCompletedCallback: CreateTaskCompletedCallback) {
    super(logger, createTaskCompletedCallback);
  }
  execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void {
    this.lockFile.lock(() => this.doExecute(analyzeEntryPoints, createCompileFn));
  }
}

/**
 * An `Executor` that processes all tasks serially, but still completes asynchronously.
 */
export class SingleProcessExecutorAsync extends SingleProcessorExecutorBase implements Executor {
  constructor(
      logger: Logger, private lockFile: AsyncLocker,
      createTaskCompletedCallback: CreateTaskCompletedCallback) {
    super(logger, createTaskCompletedCallback);
  }
  async execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      Promise<void> {
    await this.lockFile.lock(async () => this.doExecute(analyzeEntryPoints, createCompileFn));
  }
}
