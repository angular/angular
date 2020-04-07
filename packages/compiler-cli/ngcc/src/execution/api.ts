/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Task, TaskCompletedCallback, TaskQueue} from './tasks/api';

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
