/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {EntryPoint, EntryPointJsonProperty, JsonObject} from '../../packages/entry_point';
import {PartiallyOrderedList} from '../../utils';

/**
 * Represents a unit of work to be undertaken by an `Executor`.
 *
 * A task consists of processing a specific format property of an entry-point.
 * This may or may not also include processing the typings for that entry-point, which only needs to
 * happen once across all the formats.
 */
export interface Task extends JsonObject {
  /** The `EntryPoint` which needs to be processed as part of the task. */
  entryPoint: EntryPoint;

  /**
   * The `package.json` format property to process (i.e. the property which points to the file that
   * is the program entry-point).
   */
  formatProperty: EntryPointJsonProperty;

  /**
   * The list of all format properties (including `task.formatProperty`) that should be marked as
   * processed once the task has been completed, because they point to the format-path that will be
   * processed as part of the task.
   */
  formatPropertiesToMarkAsProcessed: EntryPointJsonProperty[];

  /**
   * Whether to process typings for this entry-point as part of the task.
   */
  processDts: DtsProcessing;
}

/**
 * The options for processing Typescript typings (.d.ts) files.
 */
export enum DtsProcessing {
  /**
   * Yes, process the typings for this entry point as part of the task.
   */
  Yes,
  /**
   * No, do not process the typings as part of this task - they must have already been processed by
   * another task or previous ngcc process.
   */
  No,
  /**
   * Only process the typings for this entry-point; do not render any JavaScript files for the
   * `formatProperty` of this task.
   */
  Only,
}

/**
 * Represents a partially ordered list of tasks.
 *
 * The ordering/precedence of tasks is determined by the inter-dependencies between their associated
 * entry-points. Specifically, the tasks' order/precedence is such that tasks associated to
 * dependent entry-points always come after tasks associated with their dependencies.
 *
 * As result of this ordering, it is guaranteed that - by processing tasks in the order in which
 * they appear in the list - a task's dependencies will always have been processed before processing
 * the task itself.
 *
 * See `DependencyResolver#sortEntryPointsByDependency()`.
 */
export type PartiallyOrderedTasks = PartiallyOrderedList<Task>;

/**
 * A mapping from Tasks to the Tasks that depend upon them (dependents).
 */
export type TaskDependencies = Map<Task, Set<Task>>;
export const TaskDependencies = Map;

/**
 * A function to create a TaskCompletedCallback function.
 */
export type CreateTaskCompletedCallback = (taskQueue: TaskQueue) => TaskCompletedCallback;

/**
 * A function to be called once a task has been processed.
 */
export type TaskCompletedCallback =
    (task: Task, outcome: TaskProcessingOutcome, message: string|null) => void;

/**
 * Represents the outcome of processing a `Task`.
 */
export const enum TaskProcessingOutcome {
  /** Successfully processed the target format property. */
  Processed,
  /** Failed to process the target format. */
  Failed,
}

/**
 * A wrapper around a list of tasks and providing utility methods for getting the next task of
 * interest and determining when all tasks have been completed.
 *
 * (This allows different implementations to impose different constraints on when a task's
 * processing can start.)
 */
export interface TaskQueue {
  /** Whether all tasks have been completed. */
  allTasksCompleted: boolean;

  /**
   * Get the next task whose processing can start (if any).
   *
   * This implicitly marks the task as in-progress.
   * (This information is used to determine whether all tasks have been completed.)
   *
   * @return The next task available for processing or `null`, if no task can be processed at the
   *         moment (including if there are no more unprocessed tasks).
   */
  getNextTask(): Task|null;

  /**
   * Mark a task as completed.
   *
   * This removes the task from the internal list of in-progress tasks.
   * (This information is used to determine whether all tasks have been completed.)
   *
   * @param task The task to mark as completed.
   */
  markAsCompleted(task: Task): void;

  /**
   * Mark a task as failed.
   *
   * Do not process the tasks that depend upon the given task.
   */
  markAsFailed(task: Task): void;

  /**
   * Mark a task as not processed (i.e. add an in-progress task back to the queue).
   *
   * This removes the task from the internal list of in-progress tasks and adds it back to the list
   * of pending tasks.
   *
   * @param task The task to mark as not processed.
   */
  markAsUnprocessed(task: Task): void;

  /**
   * Return a string representation of the task queue (for debugging purposes).
   *
   * @return A string representation of the task queue.
   */
  toString(): string;
}
