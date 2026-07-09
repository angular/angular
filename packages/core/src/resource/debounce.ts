/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertInInjectionContext, inject, Injector} from '../di';
import {DestroyRef} from '../linker';
import {effect} from '../render3/reactivity/effect';
import {linkedSignal} from '../render3/reactivity/linked_signal';
import {signal} from '../render3/reactivity/signal';
import {untracked} from '../render3/reactivity/untracked';
import {Resource, ResourceSnapshot, type DebounceTimer, type DebouncedOptions} from './api';
import {resourceFromSnapshots} from './from_snapshots';
import {
  invalidResourceCreationInParams,
  isInParamsFunction,
  rethrowFatalErrors,
  setInParamsFunction,
} from './resource';

/**
 * Creates a resource representing a debounced version of the source signal.
 *
 * @param source The source signal to debounce.
 * @param wait The amount of time to wait before calling the source signal, or a function that
 *   returns a promise that resolves when the debounced value should be updated.
 * @param options The options to use for the debounced signal.
 * @returns A resource representing the debounced signal.
 * @experimental 22.0
 *
 * @see [Debouncing signals with `debounced`](guide/signals/debounced)
 */
export function debounced<T>(
  source: () => T,
  wait: NoInfer<DebounceTimer<T>>,
  options?: NoInfer<DebouncedOptions<T>>,
): Resource<T> {
  if (isInParamsFunction()) {
    throw invalidResourceCreationInParams();
  }
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(debounced);
  }
  const injector = options?.injector ?? inject(Injector);

  let active: Promise<void> | void | undefined;
  let pendingValue: T | undefined;

  injector.get(DestroyRef).onDestroy(() => {
    active = undefined;
  });

  const state = linkedSignal<
    {value: T; thrown: false} | {error: unknown; thrown: true},
    ResourceSnapshot<T>
  >({
    source: () => {
      try {
        setInParamsFunction(true);
        return {value: source(), thrown: false};
      } catch (err) {
        rethrowFatalErrors(err);
        return {error: err, thrown: true};
      } finally {
        setInParamsFunction(false);
      }
    },
    computation: (res, previous) => {
      // If we already have a state from the effect or a previous read, keep it!
      // The effect is responsible for timing and state transitions.
      if (previous !== undefined) {
        return previous.value;
      }

      // On the very first evaluation, determine the initial state synchronously.
      if (res.thrown) {
        return {status: 'error', error: res.error as Error};
      }
      return {status: 'resolved', value: res.value};
    },
  });

  effect(
    () => {
      // Enter error state if the source throws.
      let value: T;
      try {
        setInParamsFunction(true);
        value = source();
      } catch (err) {
        rethrowFatalErrors(err);
        state.set({status: 'error', error: err as Error});
        active = pendingValue = undefined;
        return;
      } finally {
        setInParamsFunction(false);
      }

      const currentState = untracked(state);

      // Check if the value is the same as the previous one.
      const equal = options?.equal ?? Object.is;
      if (currentState.status === 'reloading' || currentState.status === 'loading') {
        if (equal(value, pendingValue!)) return;
      } else if (currentState.status === 'resolved') {
        if (equal(value, currentState.value!)) return;
      }

      const waitFn =
        typeof wait === 'number'
          ? () => new Promise<void>((resolve) => setTimeout(resolve, wait))
          : wait;

      const result = waitFn(value, currentState);

      if (result === undefined) {
        // Synchronous case, go straight to resolved.
        state.set({status: 'resolved', value});
        active = pendingValue = undefined;
      } else {
        // Asynchronous case:
        // If we're in error state or loading state, remain in that state.
        // Otherwise, change to loading state but keep the current value until the new one loads.
        if (currentState.status !== 'loading' && currentState.status !== 'error') {
          state.set({status: 'loading', value: currentState.value});
        }
        active = result;
        pendingValue = value;

        // Once the promise resolves, update the state to resolved.
        result.then(() => {
          if (active === result) {
            state.set({status: 'resolved', value});
            active = pendingValue = undefined;
          }
        });
      }
    },
    {injector},
  );

  return resourceFromSnapshots(state);
}
