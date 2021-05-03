/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DepGraph} from 'dependency-graph';

import {MockLogger} from '../../../../../src/ngtsc/logging/testing';
import {DtsProcessing, PartiallyOrderedTasks, Task, TaskQueue} from '../../../../src/execution/tasks/api';
import {SerialTaskQueue} from '../../../../src/execution/tasks/queues/serial_task_queue';
import {computeTaskDependencies} from '../../../../src/execution/tasks/utils';
import {EntryPoint} from '../../../../src/packages/entry_point';


describe('SerialTaskQueue', () => {
  // Helpers
  /**
   * Create a `TaskQueue` by generating mock tasks.
   *
   * NOTE: Tasks at even indices generate typings.
   *
   * @param taskCount The number of tasks to generate.
   * @return An object with the following properties:
   *         - `tasks`: The (partially ordered) list of generated mock tasks.
   *         - `queue`: The created `TaskQueue`.
   */
  const createQueue = (taskCount: number): {tasks: PartiallyOrderedTasks, queue: TaskQueue} => {
    const tasks: PartiallyOrderedTasks = [] as any;
    const graph = new DepGraph<EntryPoint>();
    for (let i = 0; i < taskCount; i++) {
      const entryPoint = {name: `entry-point-${i}`, path: `/path/to/entry/point/${i}`} as
          EntryPoint;
      const processDts = i % 2 === 0 ? DtsProcessing.Yes : DtsProcessing.No;
      tasks.push({entryPoint: entryPoint, formatProperty: `prop-${i}`, processDts} as Task);
      graph.addNode(entryPoint.path);
    }
    const dependencies = computeTaskDependencies(tasks, graph);
    return {tasks, queue: new SerialTaskQueue(new MockLogger(), tasks.slice(), dependencies)};
  };

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

  describe('allTasksCompleted', () => {
    it('should be `false`, when there are unprocessed tasks', () => {
      const {queue} = createQueue(2);
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(false);
    });

    it('should be `false`, when there are tasks in progress', () => {
      const {queue} = createQueue(1);
      queue.getNextTask();

      expect(queue.allTasksCompleted).toBe(false);
    });

    it('should be `true`, when there are no unprocessed or in-progress tasks', () => {
      const {queue} = createQueue(3);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(false);

      processNextTask(queue);
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

      processNextTask(queue);
      expect(queue.allTasksCompleted).toBe(true);
    });
  });

  describe('getNextTask()', () => {
    it('should return the tasks in order', () => {
      const {tasks, queue} = createQueue(3);

      expect(processNextTask(queue)).toBe(tasks[0]);
      expect(processNextTask(queue)).toBe(tasks[1]);
      expect(processNextTask(queue)).toBe(tasks[2]);
    });

    it('should return `null`, when there are no more tasks', () => {
      const {tasks, queue} = createQueue(3);
      tasks.forEach(() => expect(processNextTask(queue)).not.toBe(null));

      expect(processNextTask(queue)).toBe(null);
      expect(processNextTask(queue)).toBe(null);

      const {tasks: tasks2, queue: queue2} = createQueue(0);

      expect(tasks2).toEqual([]);
      expect(processNextTask(queue2)).toBe(null);
      expect(processNextTask(queue2)).toBe(null);
    });

    it('should throw, if a task is already in progress', () => {
      const {queue} = createQueue(3);
      queue.getNextTask();

      expect(() => queue.getNextTask())
          .toThrowError(
              `Trying to get next task, while there is already a task in progress: ` +
              `{entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}`);
    });
  });

  describe('markAsCompleted()', () => {
    it('should mark a task as completed, so that the next task can be picked', () => {
      const {queue} = createQueue(3);
      const task = queue.getNextTask()!;

      expect(() => queue.getNextTask()).toThrow();

      queue.markAsCompleted(task);
      expect(() => queue.getNextTask()).not.toThrow();
    });

    it('should throw, if the specified task is not in progress', () => {
      const {tasks, queue} = createQueue(3);
      queue.getNextTask();

      expect(() => queue.markAsCompleted(tasks[2]))
          .toThrowError(
              `Trying to mark task that was not in progress as completed: ` +
              `{entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}`);
    });
  });

  describe('markAsUnprocessed()', () => {
    it('should mark an in-progress task as unprocessed, so that it can be picked again', () => {
      const {queue} = createQueue(3);
      const task = queue.getNextTask()!;

      expect(() => queue.getNextTask()).toThrow();

      queue.markAsUnprocessed(task);
      expect(queue.getNextTask()).toBe(task);
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
              `{entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}`);
    });
  });

  describe('toString()', () => {
    it('should include the `TaskQueue` constructor\'s name', () => {
      const {queue} = createQueue(0);
      expect(queue.toString()).toMatch(/^SerialTaskQueue\n/);
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
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}\n');

      const task1 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  Unprocessed tasks (2): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}\n');

      queue.markAsCompleted(task1);
      const task2 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  Unprocessed tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}\n');

      queue.markAsCompleted(task2);
      processNextTask(queue);
      expect(queue.toString()).toContain('  Unprocessed tasks (0): \n');
    });

    it('should include the in-progress tasks', () => {
      const {queue} = createQueue(3);
      expect(queue.toString()).toContain('  In-progress tasks (0): ');

      const task1 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  In-progress tasks (1): \n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}');

      queue.markAsCompleted(task1);
      const task2 = queue.getNextTask()!;
      expect(queue.toString())
          .toContain(
              '  In-progress tasks (1): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No}');

      queue.markAsCompleted(task2);
      processNextTask(queue);
      expect(queue.toString()).toContain('  In-progress tasks (0): ');
    });

    it('should display all info together', () => {
      const {queue: queue1} = createQueue(0);
      expect(queue1.toString())
          .toBe(
              'SerialTaskQueue\n' +
              '  All tasks completed: true\n' +
              '  Unprocessed tasks (0): \n' +
              '  In-progress tasks (0): ');

      const {queue: queue2} = createQueue(3);
      expect(queue2.toString())
          .toBe(
              'SerialTaskQueue\n' +
              '  All tasks completed: false\n' +
              '  Unprocessed tasks (3): \n' +
              '    - {entryPoint: entry-point-0, formatProperty: prop-0, processDts: Yes}\n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No}\n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}\n' +
              '  In-progress tasks (0): ');

      processNextTask(queue2);
      const task = queue2.getNextTask()!;
      expect(queue2.toString())
          .toBe(
              'SerialTaskQueue\n' +
              '  All tasks completed: false\n' +
              '  Unprocessed tasks (1): \n' +
              '    - {entryPoint: entry-point-2, formatProperty: prop-2, processDts: Yes}\n' +
              '  In-progress tasks (1): \n' +
              '    - {entryPoint: entry-point-1, formatProperty: prop-1, processDts: No}');

      queue2.markAsCompleted(task);
      processNextTask(queue2);
      expect(queue2.toString())
          .toBe(
              'SerialTaskQueue\n' +
              '  All tasks completed: true\n' +
              '  Unprocessed tasks (0): \n' +
              '  In-progress tasks (0): ');
    });
  });
});
