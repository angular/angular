/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestBed} from '@angular/core/testing';

import {InitialRenderPendingTasks} from '../../src/initial_render_pending_tasks';

describe('InitialRenderPendingTasks', () => {
  it('should resolve a promise even if there are no tasks', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(pendingTasks.completed).toBe(false);
    await pendingTasks.whenAllTasksComplete;
    expect(pendingTasks.completed).toBe(true);
  });

  it('should wait until all tasks are completed', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(pendingTasks.completed).toBe(false);

    const taskA = pendingTasks.add();
    const taskB = pendingTasks.add();
    const taskC = pendingTasks.add();
    expect(pendingTasks.completed).toBe(false);

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskB);
    pendingTasks.remove(taskC);
    await pendingTasks.whenAllTasksComplete;
    expect(pendingTasks.completed).toBe(true);
  });

  it('should allow calls to remove the same task multiple times', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(pendingTasks.completed).toBe(false);

    const taskA = pendingTasks.add();

    expect(pendingTasks.completed).toBe(false);

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);

    await pendingTasks.whenAllTasksComplete;
    expect(pendingTasks.completed).toBe(true);
  });

  it('should be tolerant to removal of non-existent ids', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(pendingTasks.completed).toBe(false);

    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());

    await pendingTasks.whenAllTasksComplete;
    expect(pendingTasks.completed).toBe(true);
  });
});
