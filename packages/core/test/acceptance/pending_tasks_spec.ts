/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, PendingTasks} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {EMPTY, firstValueFrom, of} from 'rxjs';
import {filter, map, take, withLatestFrom} from 'rxjs/operators';

import {PendingTasksInternal} from '../../src/pending_tasks';

describe('PendingTasks', () => {
  it('should wait until all tasks are completed', async () => {
    const pendingTasks = TestBed.inject(PendingTasksInternal);
    const taskA = pendingTasks.add();
    const taskB = pendingTasks.add();
    const taskC = pendingTasks.add();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskB);
    pendingTasks.remove(taskC);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should allow calls to remove the same task multiple times', async () => {
    const pendingTasks = TestBed.inject(PendingTasksInternal);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    const taskA = pendingTasks.add();
    expect(await hasPendingTasks(pendingTasks)).toBeTrue();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should be tolerant to removal of non-existent ids', async () => {
    const pendingTasks = TestBed.inject(PendingTasksInternal);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('contributes to applicationRef stableness', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasksInternal);

    const taskA = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    pendingTasks.remove(taskA);
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(true);

    const taskB = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    pendingTasks.remove(taskB);
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(true);
  });
});

describe('public PendingTasks', () => {
  it('should allow adding and removing tasks influencing stability', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

    const removeTaskA = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    removeTaskA();
    // stability is delayed until a tick happens
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    TestBed.inject(ApplicationRef).tick();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(true);
  });

  it('should allow blocking stability with run', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

    let resolveFn: () => void;
    pendingTasks.run(() => {
      return new Promise<void>((r) => {
        resolveFn = r;
      });
    });
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    resolveFn!();
    await expectAsync(TestBed.inject(ApplicationRef).whenStable()).toBeResolved();
  });

  it('should return the result of the run function', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

    const result = await pendingTasks.run(async () => {
      await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
      return 1;
    });

    expect(result).toBe(1);
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    await expectAsync(TestBed.inject(ApplicationRef).whenStable()).toBeResolved();
  });

  xit('should stop blocking stability if run promise rejects', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

    let rejectFn: () => void;
    const task = pendingTasks.run(() => {
      return new Promise<void>((_, reject) => {
        rejectFn = reject;
      });
    });
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    try {
      rejectFn!();
      await task;
    } catch {}
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(true);
  });
});

function applicationRefIsStable(applicationRef: ApplicationRef) {
  return firstValueFrom(applicationRef.isStable);
}

function hasPendingTasks(pendingTasks: PendingTasksInternal): Promise<boolean> {
  return of(EMPTY)
    .pipe(
      withLatestFrom(pendingTasks.hasPendingTasks),
      map(([_, hasPendingTasks]) => hasPendingTasks),
    )
    .toPromise() as Promise<boolean>;
}
