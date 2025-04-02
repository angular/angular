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
} from '../../src/core';
import {SIGNAL, ReactiveNode} from '../../primitives/signals';
import {Observable, ReplaySubject} from 'rxjs';

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

  /**
   * Temporary option for forcing a synchronous emit of the signal's initial value.
   *
   * This will eventually become the default behavior, but is opt-in to allow a short migration
   * period.
   *
   * @deprecated will become default behavior
   */
  forceSyncFirstEmit?: true;
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
  if (options?.forceSyncFirstEmit === true) {
    return toObservableNext(source, options);
  }

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

/**
 * New version of `toObservable` with always-synchronous first emit.
 *
 * This will eventually replace the other implementation.
 */
function toObservableNext<T>(source: Signal<T>, options?: ToObservableOptions): Observable<T> {
  !options?.injector && assertInInjectionContext(toObservable);
  const injector = options?.injector ?? inject(Injector);

  return new Observable<T>((subscriber) => {
    let firstVersion: number = -1;
    let firstValue: T;
    try {
      firstValue = untracked(source);
    } catch (err) {
      // A failure on the first read just errors the observable without
      // creating an effect.
      subscriber.error(err);
      return;
    }
    // We cache the `version` of the first value. This lets us avoid emitting
    // this value a second time during the `effect`.
    firstVersion = signalVersion(source);

    // Emit the first value synchronously on subscription.
    subscriber.next(firstValue);

    // Create an effect that will watch the signal for future changes.
    let firstEmit = true;
    const ref = effect(
      () => {
        let value: T;
        try {
          // Read the value (& track it).
          value = source();
        } catch (err) {
          // Errors cause the Observable stream to terminate.
          untracked(() => subscriber.error(err));
          cleanup(false);
          return;
        }

        // Skip the emit of the value if it hasn't changed since the
        // synchronous emit.
        if (firstEmit) {
          firstEmit = false;
          if (signalVersion(source) === firstVersion) {
            return;
          }
        }

        untracked(() => subscriber.next(value));
      },
      {injector, manualCleanup: true},
    );

    const cleanup = (fromInjector: boolean) => {
      ref.destroy();

      if (fromInjector) {
        // If we're cleaning up because the injector is destroyed, then our
        // subscription is still active and we need to complete it.
        subscriber.complete();
      } else {
        // Otherwise, remove the cleanup function. This both prevents the
        // complete() event from being produced and allows memory to be
        // reclaimed.
        removeInjectorCleanupFn();
      }
    };

    const removeInjectorCleanupFn = injector.get(DestroyRef).onDestroy(() => {
      // Cleaning up from the `DestroyRef` means the stream is still active, so
      // we should emit completion.
      cleanup(true);
    });

    return () => cleanup(false);
  });
}

function signalVersion(source: Signal<unknown>): number {
  return (source[SIGNAL] as ReactiveNode).version;
}
