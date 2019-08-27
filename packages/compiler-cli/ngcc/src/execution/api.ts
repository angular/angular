/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EntryPoint, EntryPointJsonProperty} from '../packages/entry_point';


/**
 * The type of the function that analyzes entry-points and creates the list of tasks.
 *
 * @return A list of tasks that need to be executed in order to process the necessary format
 *         properties for all entry-points.
 */
export type AnalyzeEntryPointsFn = () => TaskQueue;

/** The type of the function that can process/compile a task. */
export type CompileFn = (task: Task) => void;

/** The type of the function that creates the `CompileFn` function used to process tasks. */
export type CreateCompileFn = (onTaskCompleted: TaskCompletedCallback) => CompileFn;

/**
 * A class that orchestrates and executes the required work (i.e. analyzes the entry-points,
 * processes the resulting tasks, does book-keeping and validates the final outcome).
 */
export interface Executor {
  execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      void|Promise<void>;
}

/** Represents a unit of work: processing a specific format property of an entry-point. */
export interface Task {
  /** The `EntryPoint` which needs to be processed as part of the task. */
  entryPoint: EntryPoint;

  /**
   * The `package.json` format property to process (i.e. the property which points to the file that
   * is the program entry-point).
   */
  formatProperty: EntryPointJsonProperty;

  /**
   * The list of all format properties (including `task.formatProperty`) that should be marked as
   * processed once the taksk has been completed, because they point to the format-path that will be
   * processed as part of the task.
   */
  formatPropertiesToMarkAsProcessed: EntryPointJsonProperty[];

  /** Whether to also process typings for this entry-point as part of the task. */
  processDts: boolean;
}

/** A function to be called once a task has been processed. */
export type TaskCompletedCallback = (task: Task, outcome: TaskProcessingOutcome) => void;

/** Represents the outcome of processing a `Task`. */
export const enum TaskProcessingOutcome {
  /** The target format property was already processed - didn't have to do anything. */
  AlreadyProcessed,

  /** Successfully processed the target format property. */
  Processed,
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
  markTaskCompleted(task: Task): void;

  /**
   * Return a string representation of the task queue (for debugging purposes).
   *
   * @return A string representation of the task queue.
   */
  toString(): string;
}
