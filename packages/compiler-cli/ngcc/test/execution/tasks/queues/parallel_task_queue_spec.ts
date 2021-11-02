/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockLogger} from '../../../../../src/ngtsc/logging/testing';
import {DtsProcessing, PartiallyOrderedTasks, TaskQueue} from '../../../../src/execution/tasks/api';
import {ParallelTaskQueue} from '../../../../src/execution/tasks/queues/parallel_task_queue';
import {computeTaskDependencies} from '../../../../src/execution/tasks/utils';
import {createTasksAndGraph} from '../../helpers';

describe('ParallelTaskQueue', () => {
  /**
   * Create a `TaskQueue` by generating mock tasks (optionally with interdependencies).
   *
   * See `createTasksAndGraph()` for important usage notes.
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
   *         - `queue`: The created `TaskQueue`.
   */
  function createQueue(
      entryPointCount: number, tasksPerEntryPointCount = 1,
      entryPointDeps: {[entryPointIndex: string]: number[]} = {}):
      {tasks: PartiallyOrderedTasks, queue: TaskQueue} {
    const {tasks, graph} =
        createTasksAndGraph(entryPointCount, tasksPerEntryPointCount, entryPointDeps);
    const dependencies = computeTaskDependencies(tasks, graph);
    return {tasks, queue: new ParallelTaskQueue(new MockLogger(), tasks.slice(), dependencies)};
  }

  /**
   * Simulate processing the next task:
   * - Request the next task from the specified queue.
   * - If a task was returned, mark it as completed.
   * - Return the task (this allows making assertions against the picked tasks in tests).
   *
   * @param queue The `TaskQueue` to get the next task from.
   * @return The "processed" task (if any).
   */
  const processNextTask = (queue: TaskQueue): ReturnType<TaskQueue['getNextTask']> => {
    const task = queue.getNextTask();
    if (task !== null) queue.markAsCompleted(task);
    return task;
  };

  describe('allTaskCompleted', () => {
    it('should be `false`, when there are unprocessed tasks', () => {
      const {queue} = createQueue(2);
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(false);
    });

    it('should be `false`, when there are tasks in progress', () => {
      const {queue} = createQueue(2);

      queue.getNextTask();
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(false);  // The first task is still in progress.
    });

    it('should be `true`, when there are no unprocess or in-progress tasks', () => {
      const {queue} = createQueue(3);

      const task1 = queue.getNextTask()!;
      const task2 = queue.getNextTask()!;
      const task3 = queue.getNextTask()!;
      expect(queue.allTasksCompleted).toBe(false);

      queue.markAsCompleted(task1);
      queue.markAsCompleted(task3);
      expect(queue.allTasksCompleted).toBe(false);  // The second task is still in progress.

      queue.markAsCompleted(task2);
      expect(queue.allTasksCompleted).toBe(true);
    });

    it('should be `true`, if the queue was empty from the beginning', () => {
      const {queue} = createQueue(0);
      expect(queue.allTasksCompleted).toBe(true);
    });

    it('should remain `true` once the queue has been emptied', () => {
      const {queue} = createQueue(1);
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(true);

      queue.getNextTask();
      expect(queue.allTasksCompleted).toBe(true);
    });
  });

  describe('getNextTask()', () => {
    it('should return the tasks in order (when they are not blocked by other tasks)', () => {
      const {tasks, queue} = createQueue(6, 1, {});  // 1 task per entry-point; no dependencies.

      expect(queue.getNextTask()).toBe(tasks[0]);
      expect(queue.getNextTask()).toBe(tasks[1]);
      expect(queue.getNextTask()).toBe(tasks[2]);
      expect(queue.getNextTask()).toBe(tasks[3]);
      expect(queue.getNextTask()).toBe(tasks[4]);
      expect(queue.getNextTask()).toBe(tasks[5]);
    });

    it('should return `null`, when there are no more tasks', () => {
      const {tasks, queue} = createQueue(3);
      tasks.forEach(() => expect(queue.getNextTask()).not.toBe(null));

      expect(queue.getNextTask()).toBe(null);
      expect(queue.getNextTask()).toBe(null);

      const {tasks: tasks2, queue: queue2} = createQueue(0);

      expect(tasks2).toEqual([]);
      expect(queue.getNextTask()).toBe(null);
      expect(queue.getNextTask()).toBe(null);
    });

    it('should return `null`, if all unprocessed tasks are blocked', () => {
      const {tasks, queue} = createQueue(2, 2, {
        0: [],   // Entry-point #0 does not depend on anything.
        1: [0],  // Entry-point #1 depends on #0.
      });

      // Verify that the first two tasks are for the first entry-point.
      expect(tasks[0].entryPoint.name).toBe('entry-point-0');
      expect(tasks[0].processDts).toBe(DtsProcessing.Yes);
      expect(tasks[1].entryPoint.name).toBe('entry-point-0');
      expect(tasks[1].processDts).toBe(DtsProcessing.No);

      // Verify that the last two tasks are for the second entry-point.
      expect(tasks[2].entryPoint.name).toBe('entry-point-1');
      expect(tasks[3].entryPoint.name).toBe('entry-point-1');

      // Return the first task, since it is not blocked.
      expect(queue.getNextTask()).toBe(tasks[0]);

      // But the rest are blocked on the first task
      expect(queue.getNextTask()).toBe(null);

      // Unblock typings task for entry-point #1 and non-typings task for entry-point #0
      queue.markAsCompleted(tasks[0]);
      expect(queue.getNextTask()).toBe(tasks[2]);
      expect(queue.getNextTask()).toBe(tasks[1]);

      // The non-typings task for entry-point #1 is blocked on the typings task
      expect(queue.getNextTask()).toBe(null);
      queue.markAsCompleted(tasks[1]);
      // Still blocked because we only completed a non-blocking task
      expect(queue.getNextTask()).toBe(null);

      // Finally, unblock non-typings task for entry-point #1
      queue.markAsCompleted(tasks[2]);
      expect(queue.getNextTask()).toBe(tasks[3]);
    });

    it('should prefer tasks that are blocking many tasks', () => {
      // Tasks by priority: #1, #0, #2, #3
      // - Entry-point #0 transitively blocks 1 entry-point(s): 2
      // - Entry-point #1 transitively blocks 2 entry-point(s): 2, 3
      // - Entry-point #2 transitively blocks 0 entry-point(s): -
      // - Entry-point #3 transitively blocks 0 entry-point(s): -
      const {tasks, queue} = createQueue(5, 1, {
        0: [],
        1: [],
        2: [0, 1],
        3: [1],
      });

      // First return task #1, since it blocks the most other tasks.
      expect(processNextTask(queue)).toBe(tasks[1]);

      // Then return task #0, since it blocks the most other tasks after #1.
      expect(processNextTask(queue)).toBe(tasks[0]);

      // Then return task #2, since it comes before #3.
      expect(processNextTask(queue)).toBe(tasks[2]);

      // Finally return task #3.
      expect(processNextTask(queue)).toBe(tasks[3]);
    });

    it('should return a lower priority task, if higher priority tasks are blocked', () => {
      // Tasks by priority: #0, #1, #3, #2, #4
      // - Entry-point #0 transitively blocks 3 entry-point(s): 1, 2, 4
      // - Entry-point #1 transitively blocks 2 entry-point(s): 2, 4
      // - Entry-point #2 transitively blocks 0 entry-point(s): -
      // - Entry-point #3 transitively blocks 1 entry-point(s): 4
      // - Entry-point #4 transitively blocks 0 entry-point(s): -
      const deps = {
        0: [],
        1: [0],
        2: [0, 1],
        3: [],
        4: [0, 1, 3],
      };

      const {tasks, queue} = createQueue(5, 1, deps);

      // First return task #0, since that blocks the most other tasks.
      expect(queue.getNextTask()).toBe(tasks[0]);

      // While task #0 is still in progress, return task #3.
      // Despite task #3's having a lower priority than #1 (blocking 1 vs 2 other tasks), task #1 is
      // currently blocked on #0 (while #3 is not blocked by anything).
      expect(queue.getNextTask()).toBe(tasks[3]);

      // Use the same dependencies as above, but complete task #0 before asking for another task to
      // verify that task #1 would be returned in this case.
      const {tasks: tasks2, queue: queue2} = createQueue(5, 1, deps);

      expect(processNextTask(queue2)).toBe(tasks2[0]);
      expect(processNextTask(queue2)).toBe(tasks2[1]);
    });

    it('should keep they initial relative order of tasks for tasks with the same priority', () => {
      // Tasks by priority: #1, #3, #0, #2, #4
      // - Entry-point #0 transitively blocks 0 entry-point(s): -
      // - Entry-point #1 transitively blocks 1 entry-point(s): 2
      // - Entry-point #2 transitively blocks 0 entry-point(s): -
      // - Entry-point #3 transitively blocks 1 entry-point(s): 4
      // - Entry-point #4 transitively blocks 0 entry-point(s): -
      const {tasks, queue} = createQueue(5, 1, {
        0: [],
        1: [],
        2: [1],
        3: [],
        4: [3],
      });

      // First return task #1 (even if it has the same priority as #3), because it comes before #3
      // in the initial task list.
      // Note that task #0 is not returned (even if it comes first in the initial task list),
      // because it has a lower priority (i.e. blocks fewer other tasks).
      expect(processNextTask(queue)).toBe(tasks[1]);

      // Then return task #3 (skipping over both #0 and #2), becasue it blocks the most other tasks.
      expect(processNextTask(queue)).toBe(tasks[3]);

      // The rest of the tasks (#0, #2, #4) block no tasks, so their initial relative order is
      // preserved.
      expect(queue.getNextTask()).toBe(tasks[0]);
      expect(queue.getNextTask()).toBe(tasks[2]);
      expect(queue.getNextTask()).toBe(tasks[4]);
    });
  });

  describe('markAsCompleted()', () => {
    it('should mark a task as completed', () => {
      const {queue} = createQueue(2);

      const task1 = queue.getNextTask()!;
      const task2 = queue.getNextTask()!;
      expect(queue.allTasksCompleted).toBe(false);

      queue.markAsCompleted(task1);
      queue.markAsCompleted(task2);
      expect(queue.allTasksCompleted).toBe(true);
    });

    it('should throw, if the specified task is not in progress', () => {
      const {tasks, queue} = createQueue(3);
      queue.getNextTask();

      expect(() => queue.markAsCompleted(tasks[2]))
          .toThrowError(
              `Trying to mark task that was not in progress as completed: ` +
              `{entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}`);
    });

    it('should remove the completed task from the lists of blocking tasks (so other tasks can be unblocked)',
       () => {
         const {tasks, queue} = createQueue(3, 1, {
           0: [],      // Entry-point #0 does not depend on anything.
           1: [0],     // Entry-point #1 depends on #0.
           2: [0, 1],  // Entry-point #2 depends on #0 and #1.
         });

         // Pick task #0 first, since it is the only one that is not blocked by other tasks.
         expect(queue.getNextTask()).toBe(tasks[0]);

         // No task available, until task #0 is completed.
         expect(queue.getNextTask()).toBe(null);

         // Once task #0 is completed, task #1 is unblocked.
         queue.markAsCompleted(tasks[0]);
         expect(queue.getNextTask()).toBe(tasks[1]);

         // Task #2 is still blocked on #1.
         expect(queue.getNextTask()).toBe(null);

         // Once task #1 is completed, task #2 is unblocked.
         queue.markAsCompleted(tasks[1]);
         expect(queue.getNextTask()).toBe(tasks[2]);
       });
  });

  describe('markAsUnprocessed()', () => {
    it('should mark an in-progress task as unprocessed, so that it can be picked again', () => {
      const {queue} = createQueue(2);

      const task1 = queue.getNextTask()!;
      const task2 = queue.getNextTask()!;
      expect(queue.allTasksCompleted).toBe(false);

      queue.markAsUnprocessed(task1);
      queue.markAsCompleted(task2);
      expect(queue.allTasksCompleted).toBe(false);

      expect(queue.getNextTask()).toBe(task1);
      expect(queue.allTasksCompleted).toBe(false);

      queue.markAsCompleted(task1);
      expect(queue.allTasksCompleted).toBe(true);
    });

    it('should throw, if the specified task is not in progress', () => {
      const {tasks, queue} = createQueue(3);
      queue.getNextTask();
      queue.markAsCompleted(tasks[0]);

      // Try with a task that is already completed.
      expect(() => queue.markAsUnprocessed(tasks[0]))
          .toThrowError(
              `Trying to mark task that was not in progress as unprocessed: ` +
              `{entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}`);

      // Try with a task that is not yet started.
      expect(() => queue.markAsUnprocessed(tasks[2]))
          .toThrowError(
              `Trying to mark task that was not in progress as unprocessed: ` +
              `{entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}`);
    });

    it('should not remove the unprocessed task from the lists of blocking tasks', () => {
      const {tasks, queue} = createQueue(3, 1, {
        0: [],      // Entry-point #0 does not depend on anything.
        1: [0],     // Entry-point #1 depends on #0.
        2: [0, 1],  // Entry-point #2 depends on #0 and #1.
      });

      // Pick task #0 first, since it is the only one that is not blocked by other tasks.
      expect(queue.getNextTask()).toBe(tasks[0]);

      // No task available, until task #0 is completed.
      expect(queue.getNextTask()).toBe(null);

      // Put task #0 back to the unprocessed tasks.
      queue.markAsUnprocessed(tasks[0]);
      expect(queue.getNextTask()).toBe(tasks[0]);

      // Other tasks are still blocked on task #0.
      expect(queue.getNextTask()).toBe(null);
    });
  });

  describe('toString()', () => {
    it('should include the `TaskQueue` constructor\'s name', () => {
      const {queue} = createQueue(0);
      expect(queue.toString()).toMatch(/^ParallelTaskQueue\n/);
    });

    it('should include the value of `allTasksCompleted`', () => {
      const {queue: queue1} = createQueue(0);
      expect(queue1.toString()).toContain('  All tasks completed: true\n');

      const {queue: queue2} = createQueue(3);
      expect(queue2.toString()).toContain('  All tasks completed: false\n');

      processNextTask(queue2);
      processNextTask(queue2);
      const task = queue2.getNextTask()!;

      expect(queue2.toString()).toContain('  All tasks completed: false\n');

      queue2.markAsCompleted(task);
      expect(queue2.toString()).toContain('  All tasks completed: true\n');
    });

    it('should include the unprocessed tasks', () => {
      const {queue} = createQueue(3);
      expect(queue.toString())
          .toContain(
              '  Unprocessed tasks (3): \n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n');

      const task1 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  Unprocessed tasks (2): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n');

      queue.markAsCompleted(task1);
      const task2 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  Unprocessed tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n');

      queue.markAsCompleted(task2);
      processNextTask(queue);
      expect(queue.toString()).toContain('  Unprocessed tasks (0): \n');
    });

    it('should include the in-progress tasks', () => {
      const {queue} = createQueue(3);
      expect(queue.toString()).toContain('  In-progress tasks (0): \n');

      const task1 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  In-progress tasks (1): \n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n');

      queue.markAsCompleted(task1);
      const task2 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  In-progress tasks (1): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n');

      queue.markAsCompleted(task2);
      processNextTask(queue);
      expect(queue.toString()).toContain('  In-progress tasks (0): \n');
    });

    it('should include the blocked/blocking tasks', () => {
      // Entry-point #0 transitively blocks 2 entry-point(s): 1, 3
      // Entry-point #1 transitively blocks 1 entry-point(s): 3
      // Entry-point #2 transitively blocks 1 entry-point(s): 3
      // Entry-point #3 transitively blocks 0 entry-point(s): -
      const {tasks, queue} = createQueue(4, 2, {
        1: [0],
        3: [1, 2],
      });

      // Since there 4 entry-points and two tasks per entry-point (8 tasks in total), in comments
      // below, tasks are denoted as `#X.Y` (where `X` is the entry-point index and Y is the task
      // index).
      // For example, the second task for the third entry-point would be `#2.1`.

      expect(queue.toString())
          .toContain(
              '  Blocked tasks (6): \n' +
              // #0.1 blocked by its typings #0.0
              '    - {entryPoint: entry-point-0, formatProperty: prop-1, processDts: No} (1): \n' +
              '        - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              // #1.0 blocked by #0.0
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes} (1): \n' +
              '        - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              // #1.1 blocked by #0.0 and its typings #1.0
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No} (2): \n' +
              '        - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              // #3.0 blocked by #0.0 (transitively), #1.0 and #2.0.
              '    - {entryPoint: entry-point-3, formatProperty: prop-0, processDts: Yes} (3): \n' +
              '        - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              // #3.1 blocked by #0.0 (transitively), #1.0 and #2.0, and its typings #3.0
              '    - {entryPoint: entry-point-3, formatProperty: prop-1, processDts: No} (4): \n' +
              '        - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-3, formatProperty: prop-0, processDts: Yes}\n' +
              // #2.1 blocked by its typings #2.0
              '    - {entryPoint: entry-point-2, formatProperty: prop-1, processDts: No} (1): \n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}');

      expect(processNextTask(queue)).toBe(tasks[0]);  // Process #0.0.
      expect(processNextTask(queue)).toBe(tasks[2]);  // Process #1.0.
      expect(queue.toString())
          .toContain(
              '  Blocked tasks (3): \n' +
              // #3.0 blocked by #2.0.
              '    - {entryPoint: entry-point-3, formatProperty: prop-0, processDts: Yes} (1): \n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              // #3.1 blocked by #2.0 and its typings #3.0
              '    - {entryPoint: entry-point-3, formatProperty: prop-1, processDts: No} (2): \n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              '        - {entryPoint: entry-point-3, formatProperty: prop-0, processDts: Yes}\n' +
              // #2.1 blocked by its typings #2.0
              '    - {entryPoint: entry-point-2, formatProperty: prop-1, processDts: No} (1): \n' +
              '        - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}');

      expect(processNextTask(queue)).toBe(tasks[4]);  // Process #2.0.
      expect(queue.toString())
          .toContain(
              '  Blocked tasks (1): \n' +
              // #3.1 blocked by its typings #3.0
              '    - {entryPoint: entry-point-3, formatProperty: prop-1, processDts: No} (1): \n' +
              '        - {entryPoint: entry-point-3, formatProperty: prop-0, processDts: Yes}');
      expect(processNextTask(queue)).toBe(tasks[6]);  // Process #3.0.
      expect(queue.toString()).toContain('  Blocked tasks (0): ');
    });

    it('should display all info together', () => {
      // An initially empty queue.
      const {queue: queue1} = createQueue(0);
      expect(queue1.toString())
          .toBe(
              'ParallelTaskQueue\n' +
              '  All tasks completed: true\n' +
              '  Unprocessed tasks (0): \n' +
              '  In-progress tasks (0): \n' +
              '  Blocked tasks (0): ');

      // A queue with three tasks (and one interdependency).
      const {tasks: tasks2, queue: queue2} = createQueue(3, 1, {2: [1]});
      expect(queue2.toString())
          .toBe(
              'ParallelTaskQueue\n' +
              '  All tasks completed: false\n' +
              '  Unprocessed tasks (3): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              '  In-progress tasks (0): \n' +
              '  Blocked tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes} (1): \n' +
              '        - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}');

      // Start processing tasks #1 and #0 (#2 is still blocked on #1).
      expect(queue2.getNextTask()).toBe(tasks2[1]);
      expect(queue2.getNextTask()).toBe(tasks2[0]);
      expect(queue2.toString())
          .toBe(
              'ParallelTaskQueue\n' +
              '  All tasks completed: false\n' +
              '  Unprocessed tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              '  In-progress tasks (2): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '  Blocked tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes} (1): \n' +
              '        - {entryPoint: entry-point-1, formatProperty: prop-0, processDts: Yes}');

      // Complete task #1 nd start processing #2 (which is not unblocked).
      queue2.markAsCompleted(tasks2[1]);
      expect(queue2.getNextTask()).toBe(tasks2[2]);
      expect(queue2.toString())
          .toBe(
              'ParallelTaskQueue\n' +
              '  All tasks completed: false\n' +
              '  Unprocessed tasks (0): \n' +
              '  In-progress tasks (2): \n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-0, processDts: Yes}\n' +
              '  Blocked tasks (0): ');

      // Complete tasks #2 and #0. All tasks are now completed.
      queue2.markAsCompleted(tasks2[2]);
      queue2.markAsCompleted(tasks2[0]);
      expect(queue2.toString())
          .toBe(
              'ParallelTaskQueue\n' +
              '  All tasks completed: true\n' +
              '  Unprocessed tasks (0): \n' +
              '  In-progress tasks (0): \n' +
              '  Blocked tasks (0): ');
    });
  });
});
