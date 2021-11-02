/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DtsProcessing} from '../../src/execution/tasks/api';
import {computeTaskDependencies, sortTasksByPriority} from '../../src/execution/tasks/utils';
import {createTasksAndGraph} from './helpers';

describe('execution utils', () => {
  describe('computeTaskDependencies()', () => {
    it('should throw, if there are multiple tasks that generate typings for a single entry-point',
       () => {
         const {tasks, graph} = createTasksAndGraph(2, 2, {
           0: [],   // Entry-point #0 does not depend on anything.
           1: [0],  // Entry-point #1 depends on #0.
         });
         tasks[1].processDts = DtsProcessing.Yes;  // Tweak task #1 to also generate typings.

         expect(() => computeTaskDependencies(tasks, graph))
             .toThrowError(
                 'Invariant violated: Multiple tasks are assigned generating typings for ' +
                 '\'/path/to/entry/point/0\':\n' +
                 '  - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
                 '  - {entryPoint: entry-point-0, formatProperty: prop-1, processDts: Yes}');
       });

    it('should add non-typings tasks to the dependents of typings tasks', () => {
      const {tasks, graph} = createTasksAndGraph(2, 2, {
        0: [],   // entry-point-0 does not depend on anything.
        1: [0],  // entry-point-1 depends on entry-point-0.
      });

      const dependents = computeTaskDependencies(tasks, graph);
      // entry-point-0
      expect(dependents.get(tasks[0])).toEqual(new Set([
        tasks[1],  // non-typings task for entry-point-0
        tasks[2],  // typings task for entry-point-1, which depends upon entry-point-0
        tasks[3],  // non-typings task for entry-point-1, which depends upon entry-point-0
      ]));
      expect(dependents.get(tasks[1])).toBeUndefined();

      // entry-point-1
      expect(dependents.get(tasks[2])).toEqual(new Set([
        tasks[3],  // non-typings task for entry-point-1
      ]));
      expect(dependents.get(tasks[3])).toBeUndefined();
    });
  });

  describe('sortTasksByPriority', () => {
    it('should return the tasks in their original order if there are no dependencies', () => {
      const {tasks} = createTasksAndGraph(3, 1);
      const sortedTasks = sortTasksByPriority(tasks, new Map());
      expect(sortedTasks).toEqual(tasks);
    });

    it('should return the tasks ordered by how many tasks depend upon them', () => {
      // Before sort:
      // 0 blocks [3]
      // 1 blocks [2, 3]
      // 2 blocks []
      // 3 blocks [4]
      // 4 blocks []
      const {tasks, graph} = createTasksAndGraph(5, 1, {0: [], 1: [], 2: [1], 3: [0, 1], 4: [3]});
      const sortedTasks = sortTasksByPriority(tasks, computeTaskDependencies(tasks, graph));
      // After sort:
      // 1 blocks [2, 3]
      // 0 blocks [3]
      // 3 blocks [4]
      // 2 blocks []
      // 4 blocks []
      expect(sortedTasks).toEqual([
        tasks[1],
        tasks[0],
        tasks[3],
        tasks[2],
        tasks[4],
      ]);
    });
  });
});
