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
import {onTaskCompleted} from './utils';


/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export class SingleProcessExecutor implements Executor {
  constructor(private logger: Logger, private pkgJsonUpdater: PackageJsonUpdater) {}

  execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void {
    this.logger.debug(`Running ngcc on ${this.constructor.name}.`);

    const tasks = analyzeEntryPoints();
    const compile =
        createCompileFn((task, outcome) => onTaskCompleted(this.pkgJsonUpdater, task, outcome));

    // Process all tasks.
    for (const task of tasks) {
      compile(task);
    }
  }
}

/**
 * An `Executor` that processes all tasks serially, but still completes asynchronously.
 */
export class AsyncSingleProcessExecutor extends SingleProcessExecutor {
  async execute(...args: Parameters<Executor['execute']>): Promise<void> {
    return super.execute(...args);
  }
}
