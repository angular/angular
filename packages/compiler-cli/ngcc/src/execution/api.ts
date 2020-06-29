/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileToWrite} from '../rendering/utils';
import {Task, TaskCompletedCallback, TaskQueue} from './tasks/api';

/**
 * The type of the function that analyzes entry-points and creates the list of tasks.
 *
 * @return A list of tasks that need to be executed in order to process the necessary format
 *         properties for all entry-points.
 */
export type AnalyzeEntryPointsFn = () => TaskQueue;

/** The type of the function that can process/compile a task. */
export type CompileFn<T> = (task: Task) => void|T;

/** The type of the function that creates the `CompileFn` function used to process tasks. */
export type CreateCompileFn = <T extends void|Promise<void>>(
    beforeWritingFiles: (transformedFiles: FileToWrite[]) => T,
    onTaskCompleted: TaskCompletedCallback) => CompileFn<T>;

/**
 * A class that orchestrates and executes the required work (i.e. analyzes the entry-points,
 * processes the resulting tasks, does book-keeping and validates the final outcome).
 */
export interface Executor {
  execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn):
      void|Promise<void>;
}
