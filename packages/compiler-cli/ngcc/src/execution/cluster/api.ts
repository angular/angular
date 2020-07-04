/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {JsonObject} from '../../packages/entry_point';
import {PackageJsonChange} from '../../writing/package_json_updater';
import {Task, TaskProcessingOutcome} from '../tasks/api';


/** A message reporting that an unrecoverable error occurred. */
export interface ErrorMessage extends JsonObject {
  type: 'error';
  error: string;
}

/** A message requesting the processing of a task. */
export interface ProcessTaskMessage extends JsonObject {
  type: 'process-task';
  task: Task;
}

/**
 * A message reporting the result of processing the currently assigned task.
 *
 * NOTE: To avoid the communication overhead, the task is not included in the message. Instead, the
 *       master is responsible for keeping a mapping of workers to their currently assigned tasks.
 */
export interface TaskCompletedMessage extends JsonObject {
  type: 'task-completed';
  outcome: TaskProcessingOutcome;
  message: string|null;
}

/** A message listing the paths to transformed files about to be written to disk. */
export interface TransformedFilesMessage extends JsonObject {
  type: 'transformed-files';
  files: AbsoluteFsPath[];
}

/** A message requesting the update of a `package.json` file. */
export interface UpdatePackageJsonMessage extends JsonObject {
  type: 'update-package-json';
  packageJsonPath: AbsoluteFsPath;
  changes: PackageJsonChange[];
}

/** The type of messages sent from cluster workers to the cluster master. */
export type MessageFromWorker =
    ErrorMessage|TaskCompletedMessage|TransformedFilesMessage|UpdatePackageJsonMessage;

/** The type of messages sent from the cluster master to cluster workers. */
export type MessageToWorker = ProcessTaskMessage;
