/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Logger} from '../../../../../src/ngtsc/logging';
import {PartiallyOrderedTasks, Task, TaskDependencies, TaskQueue} from '../api';
import {stringifyTask} from '../utils';


/**
 * A base `TaskQueue` implementation to be used as base for concrete implementations.
 */
export abstract class BaseTaskQueue implements TaskQueue {
  get allTasksCompleted(): boolean {
    return (this.tasks.length === 0) && (this.inProgressTasks.size === 0);
  }
  protected inProgressTasks = new Set<Task>();

  /**
   * A map of tasks that should be skipped, mapped to the task that caused them to be skipped.
   */
  private tasksToSkip = new Map<Task, Task>();

  constructor(
      protected logger: Logger, protected tasks: PartiallyOrderedTasks,
      protected dependencies: TaskDependencies) {}

  protected abstract computeNextTask(): Task|null;

  getNextTask(): Task|null {
    let nextTask = this.computeNextTask();
    while (nextTask !== null) {
      if (!this.tasksToSkip.has(nextTask)) {
        break;
      }
      // We are skipping this task so mark it as complete
      this.markAsCompleted(nextTask);
      const failedTask = this.tasksToSkip.get(nextTask)!;
      this.logger.warn(`Skipping processing of ${nextTask.entryPoint.name} because its dependency ${
          failedTask.entryPoint.name} failed to compile.`);
      nextTask = this.computeNextTask();
    }
    return nextTask;
  }

  markAsCompleted(task: Task): void {
    if (!this.inProgressTasks.has(task)) {
      throw new Error(
          `Trying to mark task that was not in progress as completed: ${stringifyTask(task)}`);
    }

    this.inProgressTasks.delete(task);
  }

  markAsFailed(task: Task): void {
    if (this.dependencies.has(task)) {
      for (const dependentTask of this.dependencies.get(task)!) {
        this.skipDependentTasks(dependentTask, task);
      }
    }
  }

  markAsUnprocessed(task: Task): void {
    if (!this.inProgressTasks.has(task)) {
      throw new Error(
          `Trying to mark task that was not in progress as unprocessed: ${stringifyTask(task)}`);
    }

    this.inProgressTasks.delete(task);
    this.tasks.unshift(task);
  }

  toString(): string {
    const inProgTasks = Array.from(this.inProgressTasks);

    return `${this.constructor.name}\n` +
        `  All tasks completed: ${this.allTasksCompleted}\n` +
        `  Unprocessed tasks (${this.tasks.length}): ${this.stringifyTasks(this.tasks, '    ')}\n` +
        `  In-progress tasks (${inProgTasks.length}): ${this.stringifyTasks(inProgTasks, '    ')}`;
  }

  /**
   * Mark the given `task` as to be skipped, then recursive skip all its dependents.
   *
   * @param task The task to skip
   * @param failedTask The task that failed, causing this task to be skipped
   */
  protected skipDependentTasks(task: Task, failedTask: Task) {
    this.tasksToSkip.set(task, failedTask);
    if (this.dependencies.has(task)) {
      for (const dependentTask of this.dependencies.get(task)!) {
        this.skipDependentTasks(dependentTask, failedTask);
      }
    }
  }

  protected stringifyTasks(tasks: Task[], indentation: string): string {
    return tasks.map(task => `\n${indentation}- ${stringifyTask(task)}`).join('');
  }
}
