/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '../logging/logger';
import {PackageJsonUpdater} from '../writing/package_json_updater';

import {AnalyzeEntryPointsFn, CreateCompileFn, ExecutionOptions, Executor} from './api';
import {checkForUnprocessedEntryPoints, onTaskCompleted} from './utils';


/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export class SingleProcessExecutor implements Executor {
  constructor(private logger: Logger, private pkgJsonUpdater: PackageJsonUpdater) {}

  execute(
      analyzeFn: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn,
      options: ExecutionOptions): void {
    this.logger.debug(`Running ngcc on ${this.constructor.name}.`);

    const {processingMetadataPerEntryPoint, tasks} = analyzeFn();
    const compile = createCompileFn(
        (task, outcome) =>
            onTaskCompleted(this.pkgJsonUpdater, processingMetadataPerEntryPoint, task, outcome));

    // Process all tasks.
    for (const task of tasks) {
      const processingMeta = processingMetadataPerEntryPoint.get(task.entryPoint.path) !;

      // If we only need one format processed and we already have one for the corresponding
      // entry-point, skip the task.
      if (!options.compileAllFormats && processingMeta.hasAnyProcessedFormat) continue;

      compile(task);
    }

    // Check for entry-points for which we could not process any format at all.
    checkForUnprocessedEntryPoints(processingMetadataPerEntryPoint, options.propertiesToConsider);
  }
}
