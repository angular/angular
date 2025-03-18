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
  type Signal,
  untracked,
} from '@angular/core';
import {Observable} from 'rxjs';

import {type ReactiveNode, SIGNAL} from '@angular/core/primitives/signals';
import {TO_OBSERVABLE_SYNC} from './to_observable_flag';

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
   * Specify whether `toObservable` should emit the initial value of the signal synchronously or
   * asynchronously.
   *
   * Asynchronous emit was the behavior of `toObservable` during its developer preview. This flag
   * exists to support a more incremental migration to the new behavior, where the value is emitted
   * synchronously to new subscribers.
   *
   * @deprecated
   */
  forceFirstValueAsync?: 'forceSync' | true;
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

  return new Observable<T>((subscriber) => {
    let firstVersion: number = -1;

    const shouldEmitFirstValueSync =
      // Allow opt-in before default flips.
      options?.forceFirstValueAsync === 'forceSync' ||
      // Allow opt-out after default flips.
      (TO_OBSERVABLE_SYNC && options?.forceFirstValueAsync !== true);

    if (shouldEmitFirstValueSync) {
      let firstValue: T;
      try {
        firstValue = untracked(source);
      } catch (err) {
        // A failure on the first read just errors the observable without creating
        // an effect.
        subscriber.error(err);
        return;
      }
      // We cache the `version` of the first value. This lets us avoid emitting this value a second
      // time during the `effect`.
      firstVersion = signalVersion(source);

      // Emit the first value synchronously on subscription.
      subscriber.next(firstValue);
    }

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

        // Skip the emit of the value if it hasn't changed since the synchronous emit.
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
        // If we're cleaning up because the injector is destroyed, then our subscription is still
        // active and we need to complete it.
        subscriber.complete();
      } else {
        // Otherwise, remove the cleanup function. This both prevents the complete() event from
        // being produced and allows memory to be reclaimed.
        removeInjectorCleanupFn();
      }
    };

    const removeInjectorCleanupFn = injector.get(DestroyRef).onDestroy(() => {
      // Cleaning up from the `DestroyRef` means the stream is still active, so we should emit
      // completion.
      cleanup(true);
    });

    return () => cleanup(false);
  });
}

function signalVersion(source: Signal<unknown>): number {
  return (source[SIGNAL] as ReactiveNode).version;
}
