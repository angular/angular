/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DepGraph} from 'dependency-graph';
import {DtsProcessing, PartiallyOrderedTasks, Task} from '../../src/execution/tasks/api';
import {EntryPoint} from '../../src/packages/entry_point';

/**
 * Create a set of tasks and a graph of their interdependencies.
 *
 * NOTE 1: The first task for each entry-point generates typings (which is similar to what happens
 *         in the actual code).
 * NOTE 2: The `computeTaskDependencies()` implementation relies on the fact that tasks are sorted
 * in such a way that a task can only depend upon earlier tasks (i.e. dependencies always come
 *         before dependents in the list of tasks).
 *         To preserve this attribute, you need to ensure that entry-points will only depend on
 *         entry-points with a lower index. Take this into account when defining `entryPointDeps`.
 *         (Failing to do so, will result in an error.)
 *
 * @param entryPointCount The number of different entry-points to mock.
 * @param tasksPerEntryPointCount The number of tasks to generate per entry-point (i.e. simulating
 *                                processing multiple format properties).
 * @param entryPointDeps An object mapping an entry-point to its dependencies. Keys are
 *                       entry-point indices and values are arrays of entry-point indices that the
 *                       entry-point corresponding to the key depends on.
 *                       For example, if entry-point #2 depends on entry-points #0 and #1,
 *                       `entryPointDeps` would be `{2: [0, 1]}`.
 * @return An object with the following properties:
 *         - `tasks`: The (partially ordered) list of generated mock tasks.
 *         - `graph`: The dependency graph for the generated mock entry-point.
 */
export function createTasksAndGraph(
    entryPointCount: number, tasksPerEntryPointCount = 1,
    entryPointDeps: {[entryPointIndex: string]: number[]} = {}):
    {tasks: PartiallyOrderedTasks, graph: DepGraph<EntryPoint>} {
  const entryPoints: EntryPoint[] = [];
  const tasks: PartiallyOrderedTasks = [] as any;
  const graph = new DepGraph<EntryPoint>();

  // Create the entry-points and the associated tasks.
  for (let epIdx = 0; epIdx < entryPointCount; epIdx++) {
    const entryPoint = {
      name: `entry-point-${epIdx}`,
      path: `/path/to/entry/point/${epIdx}`,
    } as EntryPoint;

    entryPoints.push(entryPoint);
    graph.addNode(entryPoint.path);

    for (let tIdx = 0; tIdx < tasksPerEntryPointCount; tIdx++) {
      const processDts = tIdx === 0 ? DtsProcessing.Yes : DtsProcessing.No;
      tasks.push({entryPoint, formatProperty: `prop-${tIdx}`, processDts} as Task);
    }
  }

  // Define entry-point interdependencies.
  for (const epIdx of Object.keys(entryPointDeps).map(strIdx => +strIdx)) {
    const fromPath = entryPoints[epIdx].path;
    for (const depIdx of entryPointDeps[epIdx]) {
      // Ensure that each entry-point only depends on entry-points at a lower index.
      if (depIdx >= epIdx) {
        throw Error(
            'Invalid `entryPointDeps`: Entry-points can only depend on entry-points at a lower ' +
            `index, but entry-point #${epIdx} depends on #${depIdx} in: ` +
            JSON.stringify(entryPointDeps, null, 2));
      }

      const toPath = entryPoints[depIdx].path;
      graph.addDependency(fromPath, toPath);
    }
  }

  return {tasks, graph};
}
