/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, DestroyRef, effect, EffectRef, inject, Injector, Signal, untracked} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';

/**
 * Options for `toObservable`.
 *
 * @developerPreview
 */
export interface ToObservableOptions {
  /**
   * The `Injector` to use when creating the underlying `effect` which watches the signal.
   *
   * If this isn't specified, the current [injection context](guide/dependency-injection-context)
   * will be used.
   */
  injector?: Injector;
}

/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context unless an injector is provided via options.
 *
 * @developerPreview
 */
export function toObservable<T>(
    source: Signal<T>,
    options?: ToObservableOptions,
    ): Observable<T> {
  !options?.injector && assertInInjectionContext(toObservable);
  const injector = options?.injector ?? inject(Injector);
  const subscribers = new Set<Subscriber<T>>();
  let lastValue: T
  let hasError = false;
  let errorSeen: any = null;
  let isComplete = false;

  const next = (value: T) => {
    lastValue = value;
    // Clone array to prevent reentrant code from adding
    // or removing subscribers during notification.
    for (const subscriber of Array.from(subscribers)) {
      subscriber.next(value);
    }
  };

  const error = (err: any) => {
    watcher.destroy();
    hasError = true;
    errorSeen = err;
    // Clone array to prevent reentrant code from adding
    // or removing subscribers during notification.
    for (const subscriber of Array.from(subscribers)) {
      subscriber.error(err);
    }
    subscribers.clear();
  };

  const complete = () => {
    watcher.destroy();
    isComplete = true;
    // Clone array to prevent reentrant code from adding
    // or removing subscribers during notification.
    for (const subscriber of Array.from(subscribers)) {
      subscriber.complete();
    }
    subscribers.clear();
  };

  const watcher = effect(() => {
    let value: T;
    try {
      value = source();
    } catch (err) {
      untracked(() => error(err));
      return;
    }
    untracked(() => next(value));
  }, {injector, manualCleanup: true});

  injector.get(DestroyRef).onDestroy(complete);

  return new Observable(subscriber => {
    if (isComplete) {
      subscriber.complete();
      return;
    }

    if (hasError) {
      subscriber.error(errorSeen);
      return;
    }
    
    subscribers.add(subscriber);
    subscriber.next(lastValue);
    return () => subscribers.delete(subscriber);
  });
}
