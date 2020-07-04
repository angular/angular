/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Logger} from '../../../../../src/ngtsc/logging';
import {PartiallyOrderedTasks, Task, TaskDependencies} from '../api';
import {getBlockedTasks, sortTasksByPriority, stringifyTask} from '../utils';
import {BaseTaskQueue} from './base_task_queue';

/**
 * A `TaskQueue` implementation that assumes tasks are processed in parallel, thus has to ensure a
 * task's dependencies have been processed before processing the task.
 */
export class ParallelTaskQueue extends BaseTaskQueue {
  /**
   * A map from Tasks to the Tasks that it depends upon.
   *
   * This is the reverse mapping of `TaskDependencies`.
   */
  private blockedTasks: Map<Task, Set<Task>>;

  constructor(logger: Logger, tasks: PartiallyOrderedTasks, dependencies: TaskDependencies) {
    super(logger, sortTasksByPriority(tasks, dependencies), dependencies);
    this.blockedTasks = getBlockedTasks(dependencies);
  }

  computeNextTask(): Task|null {
    // Look for the first available (i.e. not blocked) task.
    // (NOTE: Since tasks are sorted by priority, the first available one is the best choice.)
    const nextTaskIdx = this.tasks.findIndex(task => !this.blockedTasks.has(task));
    if (nextTaskIdx === -1) return null;

    // Remove the task from the list of available tasks and add it to the list of in-progress tasks.
    const nextTask = this.tasks[nextTaskIdx];
    this.tasks.splice(nextTaskIdx, 1);
    this.inProgressTasks.add(nextTask);

    return nextTask;
  }

  markAsCompleted(task: Task): void {
    super.markAsCompleted(task);

    if (!this.dependencies.has(task)) {
      return;
    }

    // Unblock the tasks that are dependent upon `task`
    for (const dependentTask of this.dependencies.get(task)!) {
      if (this.blockedTasks.has(dependentTask)) {
        const blockingTasks = this.blockedTasks.get(dependentTask)!;
        // Remove the completed task from the lists of tasks blocking other tasks.
        blockingTasks.delete(task);
        if (blockingTasks.size === 0) {
          // If the dependent task is not blocked any more, mark it for unblocking.
          this.blockedTasks.delete(dependentTask);
        }
      }
    }
  }

  toString(): string {
    return `${super.toString()}\n` +
        `  Blocked tasks (${this.blockedTasks.size}): ${this.stringifyBlockedTasks('    ')}`;
  }

  private stringifyBlockedTasks(indentation: string): string {
    return Array.from(this.blockedTasks)
        .map(
            ([task, blockingTasks]) =>
                `\n${indentation}- ${stringifyTask(task)} (${blockingTasks.size}): ` +
                this.stringifyTasks(Array.from(blockingTasks), `${indentation}    `))
        .join('');
  }
}
