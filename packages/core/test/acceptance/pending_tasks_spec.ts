/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ApplicationRef,
  ExperimentalPendingTasks,
  ɵPendingTasks as PendingTasks,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {EMPTY, of} from 'rxjs';
import {map, take, withLatestFrom} from 'rxjs/operators';

describe('PendingTasks', () => {
  it('should wait until all tasks are completed', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    const taskA = pendingTasks.add();
    const taskB = pendingTasks.add();
    const taskC = pendingTasks.add();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskB);
    pendingTasks.remove(taskC);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should allow calls to remove the same task multiple times', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    const taskA = pendingTasks.add();
    expect(await hasPendingTasks(pendingTasks)).toBeTrue();

    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);
    pendingTasks.remove(taskA);

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('should be tolerant to removal of non-existent ids', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);
    expect(await hasPendingTasks(pendingTasks)).toBeFalse();

    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());
    pendingTasks.remove(Math.random());

    expect(await hasPendingTasks(pendingTasks)).toBeFalse();
  });

  it('contributes to applicationRef stableness', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(PendingTasks);

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

describe('public ExperimentalPendingTasks', () => {
  it('should allow adding and removing tasks influencing stability', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const pendingTasks = TestBed.inject(ExperimentalPendingTasks);

    const taskA = pendingTasks.add();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(false);
    taskA();
    await expectAsync(applicationRefIsStable(appRef)).toBeResolvedTo(true);
  });
});

function applicationRefIsStable(applicationRef: ApplicationRef) {
  return applicationRef.isStable.pipe(take(1)).toPromise();
}

function hasPendingTasks(pendingTasks: PendingTasks): Promise<boolean> {
  return of(EMPTY)
    .pipe(
      withLatestFrom(pendingTasks.hasPendingTasks),
      map(([_, hasPendingTasks]) => hasPendingTasks),
    )
    .toPromise() as Promise<boolean>;
}
