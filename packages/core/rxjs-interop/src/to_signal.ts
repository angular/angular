/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, computed, DestroyRef, inject, Injector, signal, Signal, WritableSignal} from '@angular/core';
import {Observable, Subscribable} from 'rxjs';

import {RuntimeError, RuntimeErrorCode} from '../../src/errors';
import {untracked} from '../../src/signals';

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
  initialValue?: T;

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
   * If this is not provided, a `DestroyRef` will be retrieved from the current injection context,
   * unless manual cleanup is requested.
   */
  injector?: Injector;

  /**
   * Whether the subscription should be automatically cleaned up (via `DestroyRef`) when
   * `toObservable`'s creation context is destroyed.
   *
   * If manual cleanup is enabled, then `DestroyRef` is not used, and the subscription will persist
   * until the `Observable` itself completes.
   */
  manualCleanup?: boolean;
}

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * Before the `Observable` emits its first value, the `Signal` will return `undefined`. To avoid
 * this, either an `initialValue` can be passed or the `requireSync` option enabled.
 *
 * By default, the subscription will be automatically cleaned up when the current injection context
 * is destroyed. For example, when `toObservable` is called during the construction of a component,
 * the subscription will be cleaned up when the component is destroyed. If an injection context is
 * not available, an explicit `Injector` can be passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 */
export function toSignal<T>(source: Observable<T>|Subscribable<T>): Signal<T|undefined>;

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * Before the `Observable` emits its first value, the `Signal` will return the configured
 * `initialValue`, or `undefined` if no `initialValue` is provided. If the `Observable` is
 * guaranteed to emit synchronously, then the `requireSync` option can be passed instead.
 *
 * By default, the subscription will be automatically cleaned up when the current injection context
 * is destroyed. For example, when `toObservable` is called during the construction of a component,
 * the subscription will be cleaned up when the component is destroyed. If an injection context is
 * not available, an explicit `Injector` can be passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
export function toSignal<T>(
    source: Observable<T>|Subscribable<T>,
    options?: ToSignalOptions<undefined>&{requireSync?: false}): Signal<T|undefined>;


/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * Before the `Observable` emits its first value, the `Signal` will return the configured
 * `initialValue`. If the `Observable` is guaranteed to emit synchronously, then the `requireSync`
 * option can be passed instead.
 *
 * By default, the subscription will be automatically cleaned up when the current injection context
 * is destroyed. For example, when `toObservable` is called during the construction of a component,
 * the subscription will be cleaned up when the component is destroyed. If an injection context is
 * not available, an explicit `Injector` can be passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
export function toSignal<T, U extends T|null|undefined>(
    source: Observable<T>|Subscribable<T>,
    options: ToSignalOptions<U>&{initialValue: U, requireSync?: false}): Signal<T|U>;

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
 * By default, the subscription will be automatically cleaned up when the current injection context
 * is destroyed. For example, when `toObservable` is called during the construction of a component,
 * the subscription will be cleaned up when the component is destroyed. If an injection context is
 * not available, an explicit `Injector` can be passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
export function toSignal<T>(
    source: Observable<T>|Subscribable<T>,
    options: ToSignalOptions<undefined>&{requireSync: true}): Signal<T>;
export function toSignal<T, U = undefined>(
    source: Observable<T>|Subscribable<T>, options?: ToSignalOptions<U>): Signal<T|U> {
  const requiresCleanup = !options?.manualCleanup;
  requiresCleanup && !options?.injector && assertInInjectionContext(toSignal);
  const cleanupRef =
      requiresCleanup ? options?.injector?.get(DestroyRef) ?? inject(DestroyRef) : null;

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

  // Unsubscribe when the current context is destroyed, if requested.
  cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));

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
