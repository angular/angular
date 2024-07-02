/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ExperimentalPendingTasks} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {filter, firstValueFrom} from 'rxjs';

import {PendingTasks} from '../../src/pending_tasks';

describe('PendingTasks', () => {
  it('should wait until all tasks are completed', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    const taskA = pendingTasks.add();
    const taskB = pendingTasks.add();
    const taskC = pendingTasks.add();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskB);
    pendingTasks.remove(taskC);
    expect(pendingTasks.hasPendingTasks.value).toBeFalse();
  });

  it('should allow calls to remove the same task multiple times', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    expect(pendingTasks.hasPendingTasks.value).toBeFalse();

    const taskA = pendingTasks.add();
    expect(pendingTasks.hasPendingTasks.value).toBeTrue();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);

    expect(pendingTasks.hasPendingTasks.value).toBeFalse();
  });

  it('should be tolerant to removal of non-existent ids', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    expect(pendingTasks.hasPendingTasks.value).toBeFalse();

    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());

    expect(pendingTasks.hasPendingTasks.value).toBeFalse();
  });

  it('contributes to applicationRef stableness', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

    const taskA = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    pendingTasks.remove(taskA);
    await expectAsync(firstValueFrom(appRef.isStable.pipe(filter((s) => s)))).toBeResolved();

    const taskB = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    pendingTasks.remove(taskB);
    await expectAsync(firstValueFrom(appRef.isStable.pipe(filter((s) => s)))).toBeResolved();
  });
});

describe('public ExperimentalPendingTasks', () => {
  it('should allow adding and removing tasks influencing stability', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);

    const taskA = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    taskA();
    await expectAsync(whenStable(appRef)).toBeResolved();
  });

  it('should allow blocking stability with run', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);

    let resolveFn: () => void;
    const task = pendingTasks.run(() => {
      return new Promise<void>((r) => {
        resolveFn = r;
      });
    });
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    resolveFn!();
    await task;
    await expectAsync(whenStable(appRef)).toBeResolved();
  });

  it('should return the result of the run function', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);

    const result = pendingTasks.run(() => Promise.resolve(1));
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    await expectAsync(result).toBeResolvedTo(1);
    await expectAsync(whenStable(appRef)).toBeResolved();
  });

  it('should stop blocking stability if run promise rejects', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);

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
    await expectAsync(whenStable(appRef)).toBeResolved();
  });

  it('keeps the application unstable for tasks run one after another', async () => {
    const log: boolean[] = [];
    TestBed.inject(ApplicationRef).isStable.subscribe((stable) => {
      log.push(stable);
    });

    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);
    await pendingTasks.run(() => Promise.resolve());
    await pendingTasks.run(() => Promise.resolve());
    await pendingTasks.run(() => Promise.resolve());
    await pendingTasks.run(() => Promise.resolve());
    await whenStable(TestBed.inject(ApplicationRef));

    expect(log).toEqual([true, false, true]);
  });
});

function applicationRefIsStable(applicationRef: ApplicationRef) {
  return firstValueFrom(applicationRef.isStable);
}

function whenStable(applicationRef: ApplicationRef) {
  return firstValueFrom(applicationRef.isStable.pipe(filter((stable) => stable)));
}
