/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, computed, DestroyRef, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Observable} from 'rxjs';

import {RuntimeError, RuntimeErrorCode} from '../../src/errors';
import {untracked} from '../../src/signals';

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * The subscription will last for the lifetime of the current injection context. That is, if
 * `toSignal` is called from a component context, the subscription will be cleaned up when the
 * component is destroyed. When called outside of a component, the current `EnvironmentInjector`'s
 * lifetime will be used (which is typically the lifetime of the application itself).
 *
 * If the `Observable` does not produce a value before the `Signal` is read, the `Signal` will throw
 * an error. To avoid this, use a synchronous `Observable` (potentially created with the `startWith`
 * operator) or pass an initial value to `toSignal` as the second argument.
 *
 * `toSignal` must be called in an injection context.
 */
export function toSignal<T>(source: Observable<T>): Signal<T|undefined>;

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * The subscription will last for the lifetime of the current injection context. That is, if
 * `toSignal` is called from a component context, the subscription will be cleaned up when the
 * component is destroyed. When called outside of a component, the current `EnvironmentInjector`'s
 * lifetime will be used (which is typically the lifetime of the application itself).
 *
 * Before the `Observable` emits its first value, the `Signal` will return the configured
 * `initialValue`. If the `Observable` is known to produce a value before the `Signal` will be read,
 * `initialValue` does not need to be passed.
 *
 * `toSignal` must be called in an injection context.
 *
 * @developerPreview
 */
export function toSignal<T, U extends T|null|undefined>(
    // toSignal(Observable<Animal>, {initialValue: null}) -> Signal<Animal|null>
    source: Observable<T>, options: {initialValue: U, requireSync?: false}): Signal<T|U>;
export function toSignal<T>(
    // toSignal(Observable<Animal>, {requireSync: true}) -> Signal<Animal>
    source: Observable<T>, options: {requireSync: true}): Signal<T>;
// toSignal(Observable<Animal>) -> Signal<Animal|undefined>
export function toSignal<T, U = undefined>(
    source: Observable<T>, options?: {initialValue?: U, requireSync?: boolean}): Signal<T|U> {
  assertInInjectionContext(toSignal);

  // Note: T is the Observable value type, and U is the initial value type. They don't have to be
  // the same - the returned signal gives values of type `T`.
  let state: WritableSignal<State<T|U>>;
  if (options?.requireSync) {
    // Initially the signal is in a `NoValue` state.
    state = signal({kind: StateKind.NoValue});
  } else {
    // If an initial value was passed, use it. Otherwise, use `undefined` as the initial value.
    state = signal<State<T|U>>({kind: StateKind.Value, value: options?.initialValue as U});
  }

  const sub = source.subscribe({
    next: value => state.set({kind: StateKind.Value, value}),
    error: error => state.set({kind: StateKind.Error, error}),
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });

  if (ngDevMode && options?.requireSync && untracked(state).kind === StateKind.NoValue) {
    throw new RuntimeError(
        RuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT,
        '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
  }

  // Unsubscribe when the current context is destroyed.
  inject(DestroyRef).onDestroy(sub.unsubscribe.bind(sub));

  // The actual returned signal is a `computed` of the `State` signal, which maps the various states
  // to either values or errors.
  return computed(() => {
    const current = state();
    switch (current.kind) {
      case StateKind.Value:
        return current.value;
      case StateKind.Error:
        throw current.error;
      case StateKind.NoValue:
        // This shouldn't really happen because the error is thrown on creation.
        // TODO(alxhub): use a RuntimeError when we finalize the error semantics
        throw new RuntimeError(
            RuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT,
            '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
    }
  });
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

type State<T> = NoValueState|ValueState<T>|ErrorState;
