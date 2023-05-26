/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestBed} from '@angular/core/testing';
import {EMPTY, of} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {InitialRenderPendingTasks} from '../../src/initial_render_pending_tasks';

describe('InitialRenderPendingTasks', () => {
  it('should wait until all tasks are completed', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    const taskA = pendingTasks.add();
    const taskB = pendingTasks.add();
    const taskC = pendingTasks.add();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskB);
    pendingTasks.remove(taskC);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should allow calls to remove the same task multiple times', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    const taskA = pendingTasks.add();
    expect(await hasPendingTasks(pendingTasks)).toBeTrue();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should be tolerant to removal of non-existent ids', async () => {
    const pendingTasks = TestBed.inject(InitialRenderPendingTasks);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });
});

function hasPendingTasks(pendingTasks: InitialRenderPendingTasks): Promise<boolean> {
  return of(EMPTY)
      .pipe(
          withLatestFrom(pendingTasks.hasPendingTasks),
          map(([_, hasPendingTasks]) => hasPendingTasks),
          )
      .toPromise();
}
