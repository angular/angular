/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, ApplicationRef} from '../../src/core';
import {PendingTasksInternal} from '../../src/pending_tasks_internal';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  catchError,
  delay,
  config,
  finalize,
  firstValueFrom,
  interval,
  of,
} from 'rxjs';

import {pendingUntilEvent} from '../src';
import {TestBed} from '../../testing';

describe('pendingUntilEvent', () => {
  let taskService: PendingTasksInternal;
  let injector: EnvironmentInjector;
  let appRef: ApplicationRef;
  beforeEach(() => {
    taskService = TestBed.inject(PendingTasksInternal);
    injector = TestBed.inject(EnvironmentInjector);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should not block stability until subscription', async () => {
    const originalSource = new BehaviorSubject(0);
    const delayedSource = originalSource.pipe(delay(5), pendingUntilEvent(injector));
    expect(taskService.hasPendingTasks).toEqual(false);

    const emitPromise = firstValueFrom(delayedSource);
    expect(taskService.hasPendingTasks).toEqual(true);

    await expectAsync(emitPromise).toBeResolvedTo(0);
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  it('runs the subscription body before stability', async () => {
    const source = of(1).pipe(pendingUntilEvent(injector));

    // stable before subscription
    expect(taskService.hasPendingTasks).toEqual(false);
    source.subscribe(() => {
      // unstable within synchronous subscription body
      expect(taskService.hasPendingTasks).toBe(true);
    });
    // stable after above synchronous subscription execution
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  it('only blocks stability until first emit', async () => {
    const intervalSource = interval(5).pipe(pendingUntilEvent(injector));
    expect(taskService.hasPendingTasks).toEqual(false);

    await new Promise<void>(async (resolve) => {
      const subscription = intervalSource.subscribe(async (v) => {
        if (v === 0) {
          expect(taskService.hasPendingTasks).toBe(true);
        } else {
          await expectAsync(appRef.whenStable()).toBeResolved();
        }
        if (v === 3) {
          subscription.unsubscribe();
          resolve();
        }
      });
      expect(taskService.hasPendingTasks).toBe(true);
    });
  });

  it('should unblock stability on complete (but no emit)', async () => {
    const sub = new Subject();
    sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks).toBe(true);
    sub.complete();
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  it('should unblock stability on unsubscribe before emit', async () => {
    const sub = new Subject();
    const subscription = sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks).toBe(true);
    subscription.unsubscribe();
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  // Note that we cannot execute `finalize` operators that appear _after_ ours before
  // removing the pending task. We need to register the finalize operation on the subscription
  // as soon as the operator executes. A `finalize` operator later on in the stream will
  // be appear later in the finalizers list. These finalizers are both registered and executed
  // serially. We cannot execute our finalizer after other finalizers in the pipeline.
  it('should execute user finalize body before stability (as long as it appears first)', async () => {
    const sub = new Subject();
    let finalizeExecuted = false;
    const subscription = sub
      .asObservable()
      .pipe(
        finalize(() => {
          finalizeExecuted = true;
          expect(taskService.hasPendingTasks).toBe(true);
        }),
        pendingUntilEvent(injector),
      )
      .subscribe();
    expect(taskService.hasPendingTasks).toBe(true);
    subscription.unsubscribe();
    await expectAsync(appRef.whenStable()).toBeResolved();
    expect(finalizeExecuted).toBe(true);
  });

  it('should not throw if application is destroyed before emit', async () => {
    const sub = new Subject<void>();
    sub.asObservable().pipe(pendingUntilEvent(injector)).subscribe();
    expect(taskService.hasPendingTasks).toBe(true);
    TestBed.resetTestingModule();
    await expectAsync(appRef.whenStable()).toBeResolved();
    sub.next();
    await expectAsync(appRef.whenStable()).toBeResolved();
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
    expect(taskService.hasPendingTasks).toBe(true);
    sub.error(new Error('error in pipe'));
    await expectAsync(appRef.whenStable()).toBeResolved();
    sub.next();
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  it('should unblock stability on error in subscription', async () => {
    function nextUncaughtError() {
      return new Promise((resolve) => {
        config.onUnhandledError = (e) => {
          config.onUnhandledError = null;
          resolve(e);
        };
      });
    }
    const sub = new Subject<void>();
    sub
      .asObservable()
      .pipe(pendingUntilEvent(injector))
      .subscribe({
        next: () => {
          throw new Error('oh noes');
        },
      });
    expect(taskService.hasPendingTasks).toBe(true);
    const errorPromise = nextUncaughtError();
    sub.next();
    await expectAsync(errorPromise).toBeResolved();
    await expectAsync(appRef.whenStable()).toBeResolved();

    const errorPromise2 = nextUncaughtError();
    sub.next();
    await expectAsync(appRef.whenStable()).toBeResolved();
    await expectAsync(errorPromise2).toBeResolved();
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
    expect(taskService.hasPendingTasks).toBe(true);
    sub.next();
    observable.subscribe();
    // first subscription unblocks
    await new Promise((r) => setTimeout(r, 5));
    // still pending because the other subscribed after the emit
    expect(taskService.hasPendingTasks).toBe(true);

    sub.next();
    await new Promise((r) => setTimeout(r, 3));
    observable.subscribe();
    sub.next();
    // second subscription unblocks
    await new Promise((r) => setTimeout(r, 2));
    // still pending because third subscription delay not finished
    expect(taskService.hasPendingTasks).toBe(true);

    // finishes third subscription
    await new Promise((r) => setTimeout(r, 3));
    await expectAsync(appRef.whenStable()).toBeResolved();
  });
});
