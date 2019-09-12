/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';

import {EntryPoint} from '../../packages/entry_point';
import {PartiallyOrderedTasks, Task} from '../api';
import {stringifyTask} from '../utils';

import {BaseTaskQueue} from './base_task_queue';


/**
 * A `TaskQueue` implementation that assumes tasks are processed in parallel, thus has to ensure a
 * task's dependencies have been processed before processing the task.
 */
export class ParallelTaskQueue extends BaseTaskQueue {
  /**
   * A mapping from each task to the list of tasks that are blocking it (if any).
   *
   * A task can block another task, if the latter's entry-point depends on the former's entry-point
   * _and_ the former is also generating typings (i.e. has `processDts: true`).
   *
   * NOTE: If a task is not generating typings, then it cannot affect anything which depends on its
   *       entry-point, regardless of the dependency graph. To put this another way, only the task
   *       which produces the typings for a dependency needs to have been completed.
   */
  private blockedTasks: Map<Task, Set<Task>>;

  constructor(tasks: PartiallyOrderedTasks, graph: DepGraph<EntryPoint>) {
    const blockedTasks = computeBlockedTasks(tasks, graph);
    const sortedTasks = sortTasksByPriority(tasks, blockedTasks);

    super(sortedTasks);
    this.blockedTasks = blockedTasks;
  }

  getNextTask(): Task|null {
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

  markTaskCompleted(task: Task): void {
    super.markTaskCompleted(task);

    const unblockedTasks: Task[] = [];

    // Remove the completed task from the lists of tasks blocking other tasks.
    for (const [otherTask, blockingTasks] of Array.from(this.blockedTasks)) {
      if (blockingTasks.has(task)) {
        blockingTasks.delete(task);

        // If the other task is not blocked any more, mark it for unblocking.
        if (blockingTasks.size === 0) {
          unblockedTasks.push(otherTask);
        }
      }
    }

    // Unblock tasks that are no longer blocked.
    unblockedTasks.forEach(task => this.blockedTasks.delete(task));
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

// Helpers

/**
 * Compute a mapping of blocked tasks to the tasks that are blocking them.
 *
 * As a performance optimization, we take into account the fact that `tasks` are sorted in such a
 * way that a task can only be blocked by earlier tasks (i.e. dependencies always come before
 * dependants in the list of tasks).
 *
 * @param tasks A (partially ordered) list of tasks.
 * @param graph The dependency graph between entry-points.
 * @return The map of blocked tasks to the tasks that are blocking them.
 */
function computeBlockedTasks(
    tasks: PartiallyOrderedTasks, graph: DepGraph<EntryPoint>): Map<Task, Set<Task>> {
  const blockedTasksMap = new Map<Task, Set<Task>>();
  const candidateBlockers = new Map<string, Task>();

  tasks.forEach(task => {
    // Find the earlier tasks (`candidateBlockers`) that are blocking this task.
    const deps = graph.dependenciesOf(task.entryPoint.path);
    const blockingTasks =
        deps.filter(dep => candidateBlockers.has(dep)).map(dep => candidateBlockers.get(dep) !);

    // If this task is blocked, add it to the map of blocked tasks.
    if (blockingTasks.length > 0) {
      blockedTasksMap.set(task, new Set(blockingTasks));
    }

    // If this task can be potentially blocking (i.e. it generates typings), add it to the list
    // of candidate blockers for subsequent tasks.
    if (task.processDts) {
      const entryPointPath = task.entryPoint.path;

      // There should only be one task per entry-point that generates typings (and thus can block
      // other tasks), so the following should theoretically never happen, but check just in case.
      if (candidateBlockers.has(entryPointPath)) {
        const otherTask = candidateBlockers.get(entryPointPath) !;

        throw new Error(
            'Invariant violated: Multiple tasks are assigned generating typings for ' +
            `'${entryPointPath}':\n  - ${stringifyTask(otherTask)}\n  - ${stringifyTask(task)}`);
      }

      candidateBlockers.set(entryPointPath, task);
    }
  });

  return blockedTasksMap;
}

/**
 * Sort a list of tasks by priority.
 *
 * Priority is determined by the number of other tasks that a task is (transitively) blocking:
 * The more tasks a task is blocking the higher its priority is, because processing it will
 * potentially unblock more tasks.
 *
 * To keep the behavior predictable, if two tasks block the same number of other tasks, their
 * relative order in the original `tasks` lists is preserved.
 *
 * @param tasks A (partially ordered) list of tasks.
 * @param blockedTasks A mapping from a task to the list of tasks that are blocking it (if any).
 * @return The list of tasks sorted by priority.
 */
function sortTasksByPriority(
    tasks: PartiallyOrderedTasks, blockedTasks: Map<Task, Set<Task>>): PartiallyOrderedTasks {
  const priorityPerTask = new Map<Task, [number, number]>();
  const allBlockingTaskSets = Array.from(blockedTasks.values());
  const computePriority = (task: Task, idx: number): [number, number] =>
      [allBlockingTaskSets.reduce(
           (count, blockingTasks) => count + (blockingTasks.has(task) ? 1 : 0), 0),
       idx,
  ];

  tasks.forEach((task, i) => priorityPerTask.set(task, computePriority(task, i)));

  return tasks.slice().sort((task1, task2) => {
    const [p1, idx1] = priorityPerTask.get(task1) !;
    const [p2, idx2] = priorityPerTask.get(task2) !;

    return (p2 - p1) || (idx1 - idx2);
  });
}
