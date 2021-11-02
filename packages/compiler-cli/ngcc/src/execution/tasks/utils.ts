/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DepGraph} from 'dependency-graph';
import {EntryPoint} from '../../packages/entry_point';
import {DtsProcessing, PartiallyOrderedTasks, Task, TaskDependencies} from './api';

/** Stringify a task for debugging purposes. */
export const stringifyTask = (task: Task): string =>
    `{entryPoint: ${task.entryPoint.name}, formatProperty: ${task.formatProperty}, ` +
    `processDts: ${DtsProcessing[task.processDts]}}`;

/**
 * Compute a mapping of tasks to the tasks that are dependent on them (if any).
 *
 * Task A can depend upon task B, if either:
 *
 * * A and B have the same entry-point _and_ B is generating the typings for that entry-point
 *   (i.e. has `processDts: true`).
 * * A's entry-point depends on B's entry-point _and_ B is also generating typings.
 *
 * NOTE: If a task is not generating typings, then it cannot affect anything which depends on its
 *       entry-point, regardless of the dependency graph. To put this another way, only the task
 *       which produces the typings for a dependency needs to have been completed.
 *
 * As a performance optimization, we take into account the fact that `tasks` are sorted in such a
 * way that a task can only depend on earlier tasks (i.e. dependencies always come before
 * dependents in the list of tasks).
 *
 * @param tasks A (partially ordered) list of tasks.
 * @param graph The dependency graph between entry-points.
 * @return A map from each task to those tasks directly dependent upon it.
 */
export function computeTaskDependencies(
    tasks: PartiallyOrderedTasks, graph: DepGraph<EntryPoint>): TaskDependencies {
  const dependencies = new TaskDependencies();
  const candidateDependencies = new Map<string, Task>();

  tasks.forEach(task => {
    const entryPointPath = task.entryPoint.path;

    // Find the earlier tasks (`candidateDependencies`) that this task depends upon.
    const deps = graph.dependenciesOf(entryPointPath);
    const taskDependencies = deps.filter(dep => candidateDependencies.has(dep))
                                 .map(dep => candidateDependencies.get(dep)!);

    // If this task has dependencies, add it to the dependencies and dependents maps.
    if (taskDependencies.length > 0) {
      for (const dependency of taskDependencies) {
        const taskDependents = getDependentsSet(dependencies, dependency);
        taskDependents.add(task);
      }
    }

    if (task.processDts !== DtsProcessing.No) {
      // SANITY CHECK:
      // There should only be one task per entry-point that generates typings (and thus can be a
      // dependency of other tasks), so the following should theoretically never happen, but check
      // just in case.
      if (candidateDependencies.has(entryPointPath)) {
        const otherTask = candidateDependencies.get(entryPointPath)!;
        throw new Error(
            'Invariant violated: Multiple tasks are assigned generating typings for ' +
            `'${entryPointPath}':\n  - ${stringifyTask(otherTask)}\n  - ${stringifyTask(task)}`);
      }
      // This task can potentially be a dependency (i.e. it generates typings), so add it to the
      // list of candidate dependencies for subsequent tasks.
      candidateDependencies.set(entryPointPath, task);
    } else {
      // This task is not generating typings so we need to add it to the dependents of the task that
      // does generate typings, if that exists
      if (candidateDependencies.has(entryPointPath)) {
        const typingsTask = candidateDependencies.get(entryPointPath)!;
        const typingsTaskDependents = getDependentsSet(dependencies, typingsTask);
        typingsTaskDependents.add(task);
      }
    }
  });

  return dependencies;
}

export function getDependentsSet(map: TaskDependencies, task: Task): Set<Task> {
  if (!map.has(task)) {
    map.set(task, new Set());
  }
  return map.get(task)!;
}

/**
 * Invert the given mapping of Task dependencies.
 *
 * @param dependencies The mapping of tasks to the tasks that depend upon them.
 * @returns A mapping of tasks to the tasks that they depend upon.
 */
export function getBlockedTasks(dependencies: TaskDependencies): Map<Task, Set<Task>> {
  const blockedTasks = new Map<Task, Set<Task>>();
  for (const [dependency, dependents] of dependencies) {
    for (const dependent of dependents) {
      const dependentSet = getDependentsSet(blockedTasks, dependent);
      dependentSet.add(dependency);
    }
  }
  return blockedTasks;
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
 * @param dependencies The mapping of tasks to the tasks that depend upon them.
 * @return The list of tasks sorted by priority.
 */
export function sortTasksByPriority(
    tasks: PartiallyOrderedTasks, dependencies: TaskDependencies): PartiallyOrderedTasks {
  const priorityPerTask = new Map<Task, [number, number]>();
  const computePriority = (task: Task, idx: number):
      [number, number] => [dependencies.has(task) ? dependencies.get(task)!.size : 0, idx];

  tasks.forEach((task, i) => priorityPerTask.set(task, computePriority(task, i)));

  return tasks.slice().sort((task1, task2) => {
    const [p1, idx1] = priorityPerTask.get(task1)!;
    const [p2, idx2] = priorityPerTask.get(task2)!;

    return (p2 - p1) || (idx1 - idx2);
  });
}
