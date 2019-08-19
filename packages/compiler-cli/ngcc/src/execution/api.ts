/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EntryPoint, EntryPointJsonProperty} from '../packages/entry_point';

/** The type of the function that analyzes entry-points and creates the list of tasks. */
export type AnalyzeEntryPointsFn = () => {
  processingMetadataPerEntryPoint: Map<string, EntryPointProcessingMetadata>;
  tasks: Task[];
};

/** The type of the function that can process/compile a task. */
export type CompileFn = (task: Task) => void;

/** The type of the function that creates the `CompileFn` function used to process tasks. */
export type CreateCompileFn = (onTaskCompleted: TaskCompletedCallback) => CompileFn;

/** Options related to the orchestration/execution of tasks. */
export interface ExecutionOptions {
  compileAllFormats: boolean;
  propertiesToConsider: string[];
}

/**
 * A class that orchestrates and executes the required work (i.e. analyzes the entry-points,
 * processes the resulting tasks, does book-keeping and validates the final outcome).
 */
export interface Executor {
  execute(
      analyzeFn: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn,
      options: ExecutionOptions): void|Promise<void>;
}

/** Represents metadata related to the processing of an entry-point. */
export interface EntryPointProcessingMetadata {
  /**
   * Whether the typings for the entry-point have been successfully processed (or were already
   * processed).
   */
  hasProcessedTypings: boolean;

  /**
   * Whether at least one format has been successfully processed (or was already processed) for the
   * entry-point.
   */
  hasAnyProcessedFormat: boolean;
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
