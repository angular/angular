/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  assertInInjectionContext,
  DestroyRef,
  effect,
  inject,
  Injector,
  Signal,
  untracked,
} from '@angular/core';
import {Observable, ReplaySubject, MonoTypeOperatorFunction, takeUntil} from 'rxjs';

/**
 * Operator which completes the Observable when the calling context (component, directive, service,
 * etc) is destroyed.
 *
 * @param destroyRef optionally, the `DestroyRef` representing the current context. This can be
 *     passed explicitly to use `takeUntilDestroyed` outside of an [injection
 * context](guide/di/dependency-injection-context). Otherwise, the current `DestroyRef` is injected.
 *
 * @publicApi
 */
export function takeUntilDestroyed<T>(destroyRef?: DestroyRef): MonoTypeOperatorFunction<T> {
  if (!destroyRef) {
    assertInInjectionContext(takeUntilDestroyed);
    destroyRef = inject(DestroyRef);
  }

  const destroyed$ = new Observable<void>((observer) => {
    const unregisterFn = destroyRef!.onDestroy(observer.next.bind(observer));
    return unregisterFn;
  });

  return <T>(source: Observable<T>) => {
    return source.pipe(takeUntil(destroyed$));
  };
}

/**
 * Options for `toObservable`.
 *
 * @developerPreview
 */
export interface ToObservableOptions {
  /**
   * The `Injector` to use when creating the underlying `effect` which watches the signal.
   *
   * If this isn't specified, the current [injection context](guide/di/dependency-injection-context)
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
export function toObservable<T>(source: Signal<T>, options?: ToObservableOptions): Observable<T> {
  !options?.injector && assertInInjectionContext(toObservable);
  const injector = options?.injector ?? inject(Injector);
  const subject = new ReplaySubject<T>(1);

  const watcher = effect(
    () => {
      let value: T;
      try {
        value = source();
      } catch (err) {
        untracked(() => subject.error(err));
        return;
      }
      untracked(() => subject.next(value));
    },
    {injector, manualCleanup: true},
  );

  injector.get(DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });

  return subject.asObservable();
}
