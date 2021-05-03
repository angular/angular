/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathManipulation, ReadonlyFileSystem} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';
import {markAsProcessed} from '../../packages/build_marker';
import {getEntryPointFormat, PackageJsonFormatProperties} from '../../packages/entry_point';
import {PackageJsonUpdater} from '../../writing/package_json_updater';

import {DtsProcessing, Task, TaskCompletedCallback, TaskProcessingOutcome, TaskQueue} from './api';

/**
 * A function that can handle a specific outcome of a task completion.
 *
 * These functions can be composed using the `composeTaskCompletedCallbacks()`
 * to create a `TaskCompletedCallback` function that can be passed to an `Executor`.
 */
export type TaskCompletedHandler = (task: Task, message: string|null) => void;

/**
 * Compose a group of TaskCompletedHandlers into a single TaskCompletedCallback.
 *
 * The compose callback will receive an outcome and will delegate to the appropriate handler based
 * on this outcome.
 *
 * @param callbacks a map of outcomes to handlers.
 */
export function composeTaskCompletedCallbacks(
    callbacks: Record<TaskProcessingOutcome, TaskCompletedHandler>): TaskCompletedCallback {
  return (task: Task, outcome: TaskProcessingOutcome, message: string|null): void => {
    const callback = callbacks[outcome];
    if (callback === undefined) {
      throw new Error(`Unknown task outcome: "${outcome}" - supported outcomes: ${
          JSON.stringify(Object.keys(callbacks))}`);
    }
    callback(task, message);
  };
}

/**
 * Create a handler that will mark the entry-points in a package as being processed.
 *
 * @param pkgJsonUpdater The service used to update the package.json
 */
export function createMarkAsProcessedHandler(
    fs: PathManipulation, pkgJsonUpdater: PackageJsonUpdater): TaskCompletedHandler {
  return (task: Task): void => {
    const {entryPoint, formatPropertiesToMarkAsProcessed, processDts} = task;
    const packageJsonPath = fs.resolve(entryPoint.path, 'package.json');
    const propsToMarkAsProcessed: PackageJsonFormatProperties[] =
        [...formatPropertiesToMarkAsProcessed];
    if (processDts !== DtsProcessing.No) {
      propsToMarkAsProcessed.push('typings');
    }
    markAsProcessed(
        pkgJsonUpdater, entryPoint.packageJson, packageJsonPath, propsToMarkAsProcessed);
  };
}

/**
 * Create a handler that will throw an error.
 */
export function createThrowErrorHandler(fs: ReadonlyFileSystem): TaskCompletedHandler {
  return (task: Task, message: string|null): void => {
    throw new Error(createErrorMessage(fs, task, message));
  };
}

/**
 * Create a handler that logs an error and marks the task as failed.
 */
export function createLogErrorHandler(
    logger: Logger, fs: ReadonlyFileSystem, taskQueue: TaskQueue): TaskCompletedHandler {
  return (task: Task, message: string|null): void => {
    taskQueue.markAsFailed(task);
    logger.error(createErrorMessage(fs, task, message));
  };
}

function createErrorMessage(fs: ReadonlyFileSystem, task: Task, message: string|null): string {
  const jsFormat = `\`${task.formatProperty}\` as ${
      getEntryPointFormat(fs, task.entryPoint, task.formatProperty) ?? 'unknown format'}`;
  const format = task.typingsOnly ? `typings only using ${jsFormat}` : jsFormat;
  message = message !== null ? ` due to ${message}` : '';
  return `Failed to compile entry-point ${task.entryPoint.name} (${format})` + message;
}
