/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '../di';
import {DestroyRef} from '../linker';
import {effect} from '../render3/reactivity/effect';
import {signal} from '../render3/reactivity/signal';
import {untracked} from '../render3/reactivity/untracked';
import {Resource, ResourceSnapshot, type DebouncedOptions} from './api';
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
 */
export function debounced<T>(
  source: () => T,
  wait: NoInfer<number | ((value: T, lastValue: ResourceSnapshot<T>) => Promise<void> | void)>,
  options?: NoInfer<DebouncedOptions<T>>,
): Resource<T> {
  if (isInParamsFunction()) {
    throw invalidResourceCreationInParams();
  }

  const state = signal<ResourceSnapshot<T>>({
    status: 'resolved',
    value: untracked(() => {
      try {
        setInParamsFunction(true);
        return source();
      } finally {
        setInParamsFunction(false);
      }
    }),
  });

  let active: Promise<void> | void | undefined;
  let pendingValue: T | undefined;

  (options?.injector?.get(DestroyRef) ?? inject(DestroyRef)).onDestroy(() => {
    active = undefined;
  });

  effect(
    () => {
      // Enter error state if the source throws.
      // TODO: does this make sense?
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
      if (currentState.status === 'reloading') {
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
    {injector: options?.injector},
  );

  return resourceFromSnapshots(state);
}
