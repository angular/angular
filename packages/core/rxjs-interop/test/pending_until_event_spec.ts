/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, ɵPendingTasks as PendingTasks} from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  catchError,
  delay,
  finalize,
  firstValueFrom,
  interval,
  map,
  of,
} from 'rxjs';

import {pendingUntilEvent} from '../src/pending_until_event';
import {TestBed} from '@angular/core/testing';

describe('pendingUntilEvent', () => {
  let taskService: PendingTasks;
  let injector: EnvironmentInjector;
  beforeEach(() => {
    taskService = TestBed.inject(PendingTasks);
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('should not block stability until subscription', async () => {
    const originalSource = new BehaviorSubject(0);
    const delayedSource = originalSource.pipe(delay(5), pendingUntilEvent(injector));
    expect(taskService.hasPendingTasks.value).toEqual(false);

    const emitPromise = firstValueFrom(delayedSource);
    expect(taskService.hasPendingTasks.value).toEqual(true);

    await expectAsync(emitPromise).toBeResolvedTo(0);
    expect(taskService.hasPendingTasks.value).toEqual(false);
  });

  it('runs the subscription body before stability', async () => {
    const source = of(1).pipe(pendingUntilEvent(injector));

    // stable before subscription
    expect(taskService.hasPendingTasks.value).toEqual(false);
    source.subscribe(() => {
      // unstable within synchronous subscription body
      expect(taskService.hasPendingTasks.value).toBe(true);
    });
    // stable after above synchronous subscription execution
    expect(taskService.hasPendingTasks.value).toBe(false);
  });

  it('only blocks stability until first emit', async () => {
    const intervalSource = interval(5).pipe(pendingUntilEvent(injector));
    expect(taskService.hasPendingTasks.value).toEqual(false);

    await new Promise<void>((resolve) => {
      const subscription = intervalSource.subscribe((v) => {
        if (v === 0) {
          expect(taskService.hasPendingTasks.value).toBe(true);
        } else {
          expect(taskService.hasPendingTasks.value).toBe(false);
        }
        if (v === 3) {
          subscription.unsubscribe();
          resolve();
        }
      });
      expect(taskService.hasPendingTasks.value).toBe(true);
    });
  });

  it('should unblock stability on complete (but no emit)', () => {
    const sub = new Subject();
    sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    sub.complete();
    expect(taskService.hasPendingTasks.value).toBe(false);
  });

  it('should unblock stability on unsubscribe before emit', () => {
    const sub = new Subject();
    const subscription = sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    subscription.unsubscribe();
    expect(taskService.hasPendingTasks.value).toBe(false);
  });

  // Note that we cannot execute `finalize` operators that appear _after_ ours before
  // removing the pending task. We need to register the finalize operation on the subscription
  // as soon as the operator executes. A `finalize` operator later on in the stream will
  // be appear later in the finalizers list. These finalizers are both registered and executed
  // serially. We cannot execute our finalizer after other finalizers in the pipeline.
  it('should execute user finalize body before stability (as long as it appears first)', () => {
    const sub = new Subject();
    let finalizeExecuted = false;
    const subscription = sub
      .asObservable()
      .pipe(
        finalize(() => {
          finalizeExecuted = true;
          expect(taskService.hasPendingTasks.value).toBe(true);
        }),
        pendingUntilEvent(injector),
      )
      .subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    subscription.unsubscribe();
    expect(taskService.hasPendingTasks.value).toBe(false);
    expect(finalizeExecuted).toBe(true);
  });

  it('should not throw if application is destroyed before emit', () => {
    const sub = new Subject<void>();
    sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    TestBed.resetTestingModule();
    expect(taskService.hasPendingTasks.value).toBe(false);
    sub.next();
    expect(taskService.hasPendingTasks.value).toBe(false);
  });

  it('should unblock stability on error before emit', async () => {
    const sub = new Subject<void>();
    sub
      .asObservable()
      .pipe(
        pendingUntilEvent(injector),
        catchError(() => EMPTY),
      )
      .subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    sub.error(new Error('error in pipe'));
    expect(taskService.hasPendingTasks.value).toBe(false);
    sub.next();
    expect(taskService.hasPendingTasks.value).toBe(false);
  });

  it('finalize and complete are delivered correctly', () => {
    const sub = new Subject<void>();
    let log: string[] = [];
    const obs1 = sub.asObservable().pipe(
      pendingUntilEvent(injector),
      finalize(() => {
        log.push('finalize');
      }),
    );

    // complete after subscription
    obs1.subscribe({
      complete: () => {
        log.push('complete');
      },
    });
    sub.complete();
    expect(log).toEqual(['complete', 'finalize']);

    // already completed before subscription
    log.length = 0;
    obs1.subscribe({
      complete: () => {
        log.push('complete');
      },
    });
    expect(log).toEqual(['complete', 'finalize']);

    log.length = 0;
    new Subject()
      .asObservable()
      .pipe(
        pendingUntilEvent(injector),
        finalize(() => {
          log.push('finalize');
        }),
      )
      .subscribe({
        complete: () => {
          log.push('complete');
        },
      })
      .unsubscribe();
    expect(log).toEqual(['finalize']);
  });

  it('should block stability for each new subscriber', async () => {
    const sub = new Subject<void>();
    const observable = sub.asObservable().pipe(delay(5), pendingUntilEvent(injector));

    observable.subscribe();
    expect(taskService.hasPendingTasks.value).toBe(true);
    sub.next();
    observable.subscribe();
    // first subscription unblocks
    await new Promise((r) => setTimeout(r, 5));
    // still pending because the other subscribed after the emit
    expect(taskService.hasPendingTasks.value).toBe(true);

    sub.next();
    await new Promise((r) => setTimeout(r, 3));
    observable.subscribe();
    sub.next();
    // second subscription unblocks
    await new Promise((r) => setTimeout(r, 2));
    // still pending because third subscription delay not finished
    expect(taskService.hasPendingTasks.value).toBe(true);

    // finishes third subscription
    await new Promise((r) => setTimeout(r, 3));
    expect(taskService.hasPendingTasks.value).toBe(false);
  });
});
