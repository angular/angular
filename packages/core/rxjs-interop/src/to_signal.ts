/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  assertInInjectionContext,
  assertNotInReactiveContext,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal,
  Signal,
  WritableSignal,
  ɵRuntimeError,
  ɵRuntimeErrorCode,
} from '@angular/core';
import {ValueEqualityFn} from '@angular/core/primitives/signals';
import {Observable, Subscribable} from 'rxjs';

/**
 * Options for `toSignal`.
 *
 * @publicApi
 */
export interface ToSignalOptions<T> {
  /**
   * Initial value for the signal produced by `toSignal`.
   *
   * This will be the value of the signal until the observable emits its first value.
   */
  initialValue?: unknown;

  /**
   * Whether to require that the observable emits synchronously when `toSignal` subscribes.
   *
   * If this is `true`, `toSignal` will assert that the observable produces a value immediately upon
   * subscription. Setting this option removes the need to either deal with `undefined` in the
   * signal type or provide an `initialValue`, at the cost of a runtime error if this requirement is
   * not met.
   */
  requireSync?: boolean;

  /**
   * `Injector` which will provide the `DestroyRef` used to clean up the Observable subscription.
   *
   * If this is not provided, a `DestroyRef` will be retrieved from the current [injection
   * context](guide/di/dependency-injection-context), unless manual cleanup is requested.
   */
  injector?: Injector;

  /**
   * Whether the subscription should be automatically cleaned up (via `DestroyRef`) when
   * `toSignal`'s creation context is destroyed.
   *
   * If manual cleanup is enabled, then `DestroyRef` is not used, and the subscription will persist
   * until the `Observable` itself completes.
   */
  manualCleanup?: boolean;

  /**
   * Whether `toSignal` should throw errors from the Observable error channel back to RxJS, where
   * they'll be processed as uncaught exceptions.
   *
   * In practice, this means that the signal returned by `toSignal` will keep returning the last
   * good value forever, as Observables which error produce no further values. This option emulates
   * the behavior of the `async` pipe.
   */
  rejectErrors?: boolean;

  /**
   * A comparison function which defines equality for values emitted by the observable.
   *
   * Equality comparisons are executed against the initial value if one is provided.
   */
  equal?: ValueEqualityFn<T>;
}

// Base case: no options -> `undefined` in the result type.
export function toSignal<T>(source: Observable<T> | Subscribable<T>): Signal<T | undefined>;
// Options with `undefined` initial value and no `requiredSync` -> `undefined`.
export function toSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | undefined>> & {
    initialValue?: undefined;
    requireSync?: false;
  },
): Signal<T | undefined>;
// Options with `null` initial value -> `null`.
export function toSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | null>> & {initialValue?: null; requireSync?: false},
): Signal<T | null>;
// Options with `undefined` initial value and `requiredSync` -> strict result type.
export function toSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T>> & {initialValue?: undefined; requireSync: true},
): Signal<T>;
// Options with a more specific initial value type.
export function toSignal<T, const U extends T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | U>> & {initialValue: U; requireSync?: false},
): Signal<T | U>;

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * With `requireSync` set to `true`, `toSignal` will assert that the `Observable` produces a value
 * immediately upon subscription. No `initialValue` is needed in this case, and the returned signal
 * does not include an `undefined` type.
 *
 * By default, the subscription will be automatically cleaned up when the current [injection
 * context](guide/di/dependency-injection-context) is destroyed. For example, when `toSignal` is
 * called during the construction of a component, the subscription will be cleaned up when the
 * component is destroyed. If an injection context is not available, an explicit `Injector` can be
 * passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
export function toSignal<T, U = undefined>(
  source: Observable<T> | Subscribable<T>,
  options?: ToSignalOptions<T | U> & {initialValue?: U},
): Signal<T | U> {
  typeof ngDevMode !== 'undefined' &&
    ngDevMode &&
    assertNotInReactiveContext(
      toSignal,
      'Invoking `toSignal` causes new subscriptions every time. ' +
        'Consider moving `toSignal` outside of the reactive context and read the signal value where needed.',
    );

  const requiresCleanup = !options?.manualCleanup;
  requiresCleanup && !options?.injector && assertInInjectionContext(toSignal);
  const cleanupRef = requiresCleanup
    ? (options?.injector?.get(DestroyRef) ?? inject(DestroyRef))
    : null;

  const equal = makeToSignalEqual(options?.equal);

  // Note: T is the Observable value type, and U is the initial value type. They don't have to be
  // the same - the returned signal gives values of type `T`.
  let state: WritableSignal<State<T | U>>;
  if (options?.requireSync) {
    // Initially the signal is in a `NoValue` state.
    state = signal({kind: StateKind.NoValue}, {equal});
  } else {
    // If an initial value was passed, use it. Otherwise, use `undefined` as the initial value.
    state = signal<State<T | U>>(
      {kind: StateKind.Value, value: options?.initialValue as U},
      {equal},
    );
  }

  let destroyUnregisterFn: (() => void) | undefined;

  // Note: This code cannot run inside a reactive context (see assertion above). If we'd support
  // this, we would subscribe to the observable outside of the current reactive context, avoiding
  // that side-effect signal reads/writes are attribute to the current consumer. The current
  // consumer only needs to be notified when the `state` signal changes through the observable
  // subscription. Additional context (related to async pipe):
  // https://github.com/angular/angular/pull/50522.
  const sub = source.subscribe({
    next: (value) => state.set({kind: StateKind.Value, value}),
    error: (error) => {
      if (options?.rejectErrors) {
        // Kick the error back to RxJS. It will be caught and rethrown in a macrotask, which causes
        // the error to end up as an uncaught exception.
        throw error;
      }
      state.set({kind: StateKind.Error, error});
    },
    complete: () => {
      destroyUnregisterFn?.();
    },
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });

  if (options?.requireSync && state().kind === StateKind.NoValue) {
    throw new ɵRuntimeError(
      ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT,
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.',
    );
  }

  // Unsubscribe when the current context is destroyed, if requested.
  destroyUnregisterFn = cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));

  // The actual returned signal is a `computed` of the `State` signal, which maps the various states
  // to either values or errors.
  return computed(
    () => {
      const current = state();
      switch (current.kind) {
        case StateKind.Value:
          return current.value;
        case StateKind.Error:
          throw current.error;
        case StateKind.NoValue:
          // This shouldn't really happen because the error is thrown on creation.
          throw new ɵRuntimeError(
            ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.',
          );
      }
    },
    {equal: options?.equal},
  );
}

function makeToSignalEqual<T>(
  userEquality: ValueEqualityFn<T> = Object.is,
): ValueEqualityFn<State<T>> {
  return (a, b) =>
    a.kind === StateKind.Value && b.kind === StateKind.Value && userEquality(a.value, b.value);
}

const enum StateKind {
  NoValue,
  Value,
  Error,
}

interface NoValueState {
  kind: StateKind.NoValue;
}

interface ValueState<T> {
  kind: StateKind.Value;
  value: T;
}

interface ErrorState {
  kind: StateKind.Error;
  error: unknown;
}

type State<T> = NoValueState | ValueState<T> | ErrorState;
