/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertInInjectionContext, PendingTasks, inject, Injector} from '../../src/core';
import {MonoTypeOperatorFunction, Observable} from 'rxjs';

/**
 * Operator which makes the application unstable until the observable emits, completes, errors, or is unsubscribed.
 *
 * Use this operator in observables whose subscriptions are important for rendering and should be included in SSR serialization.
 *
 * @param injector The `Injector` to use during creation. If this is not provided, the current injection context will be used instead (via `inject`).
 *
 * @developerPreview 20.0
 */
export function pendingUntilEvent<T>(injector?: Injector): MonoTypeOperatorFunction<T> {
  if (injector === undefined) {
    ngDevMode && assertInInjectionContext(pendingUntilEvent);
    injector = inject(Injector);
  }
  const taskService = injector.get(PendingTasks);

  return (sourceObservable) => {
    return new Observable<T>((originalSubscriber) => {
      // create a new task on subscription
      const removeTask = taskService.add();

      let cleanedUp = false;
      function cleanupTask() {
        if (cleanedUp) {
          return;
        }

        removeTask();
        cleanedUp = true;
      }

      const innerSubscription = sourceObservable.subscribe({
        next: (v) => {
          originalSubscriber.next(v);
          cleanupTask();
        },
        complete: () => {
          originalSubscriber.complete();
          cleanupTask();
        },
        error: (e) => {
          originalSubscriber.error(e);
          cleanupTask();
        },
      });
      innerSubscription.add(() => {
        originalSubscriber.unsubscribe();
        cleanupTask();
      });
      return innerSubscription;
    });
  };
}
