/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Task, TaskQueue} from '../api';
import {stringifyTask} from '../utils';


/**
 * A base `TaskQueue` implementation to be used as base for concrete implementations.
 *
 * NOTE: It is assumed that `tasks` are sorted in such a way that tasks associated to dependent
 *       entry-points always come after tasks associated with their dependencies.
 *       See `DependencyResolver#sortEntryPointsByDependency()`.
 */
export abstract class BaseTaskQueue implements TaskQueue {
  get allTasksCompleted(): boolean {
    return (this.tasks.length === 0) && (this.inProgressTasks.size === 0);
  }
  protected inProgressTasks = new Set<Task>();

  constructor(protected tasks: Task[]) {}

  abstract getNextTask(): Task|null;

  markTaskCompleted(task: Task): void {
    if (!this.inProgressTasks.has(task)) {
      throw new Error(
          `Trying to mark task that was not in progress as completed: ${stringifyTask(task)}`);
    }

    this.inProgressTasks.delete(task);
  }

  toString(): string {
    const inProgTasks = Array.from(this.inProgressTasks);

    return `${this.constructor.name}\n` +
        `  All tasks completed: ${this.allTasksCompleted}\n` +
        `  Unprocessed tasks (${this.tasks.length}): ${this.stringifyTasks(this.tasks, '    ')}\n` +
        `  In-progress tasks (${inProgTasks.length}): ${this.stringifyTasks(inProgTasks, '    ')}`;
  }

  protected stringifyTasks(tasks: Task[], indentation: string): string {
    return tasks.map(task => `\n${indentation}- ${stringifyTask(task)}`).join('');
  }
}
