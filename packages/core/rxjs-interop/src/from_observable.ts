/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, computed, DestroyRef, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `fromObservable` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * The subscription will last for the lifetime of the current injection context. That is, if
 * `fromObservable` is called from a component context, the subscription will be cleaned up when the
 * component is destroyed. When called outside of a component, the current `EnvironmentInjector`'s
 * lifetime will be used (which is typically the lifetime of the application itself).
 *
 * If the `Observable` does not produce a value before the `Signal` is read, the `Signal` will throw
 * an error. To avoid this, use a synchronous `Observable` (potentially created with the `startWith`
 * operator) or pass an initial value to `fromObservable` as the second argument.
 *
 * `fromObservable` must be called in an injection context.
 */
export function fromObservable<T>(source: Observable<T>): Signal<T>;

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `fromObservable` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * The subscription will last for the lifetime of the current injection context. That is, if
 * `fromObservable` is called from a component context, the subscription will be cleaned up when the
 * component is destroyed. When called outside of a component, the current `EnvironmentInjector`'s
 * lifetime will be used (which is typically the lifetime of the application itself).
 *
 * Before the `Observable` emits its first value, the `Signal` will return the configured
 * `initialValue`. If the `Observable` is known to produce a value before the `Signal` will be read,
 * `initialValue` does not need to be passed.
 *
 * `fromObservable` must be called in an injection context.
 *
 * @developerPreview
 */
export function fromObservable<T, U extends T|null|undefined>(
    // fromObservable(Observable<Animal>) -> Signal<Cat>
    source: Observable<T>, initialValue: U): Signal<T|U>;
export function fromObservable<T, U = never>(source: Observable<T>, initialValue?: U): Signal<T|U> {
  assertInInjectionContext(fromObservable);

  // Note: T is the Observable value type, and U is the initial value type. They don't have to be
  // the same - the returned signal gives values of type `T`.
  let state: WritableSignal<State<T|U>>;
  if (initialValue === undefined && arguments.length !== 2) {
    // No initial value was passed, so initially the signal is in a `NoValue` state and will throw
    // if accessed.
    state = signal({kind: StateKind.NoValue});
  } else {
    // An initial value was passed, so use it.
    state = signal<State<T|U>>({kind: StateKind.Value, value: initialValue!});
  }

  const sub = source.subscribe({
    next: value => state.set({kind: StateKind.Value, value}),
    error: error => state.set({kind: StateKind.Error, error}),
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });

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
        // TODO(alxhub): use a RuntimeError when we finalize the error semantics
        throw new Error(`fromObservable() signal read before the Observable emitted`);
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
