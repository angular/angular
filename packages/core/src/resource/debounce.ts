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
import {Resource, ResourceSnapshot, type BaseResourceOptions} from './api';
import {resourceFromSnapshots} from './from_snapshots';

export interface DebounceResourceOptions<T> extends BaseResourceOptions<T, T> {
  params: () => T;
  wait: number | ((value: T, lastValue: ResourceSnapshot<T | undefined>) => Promise<void> | void);
}

export function debounceResource<T>(
  options: DebounceResourceOptions<T> & {
    wait: number | ((value: T, lastValue: ResourceSnapshot<T>) => Promise<void> | void);
    defaultValue: NoInfer<T>;
  },
): Resource<T>;
export function debounceResource<T>(options: DebounceResourceOptions<T>): Resource<T | undefined>;
export function debounceResource<T>(options: DebounceResourceOptions<T>): Resource<T | undefined> {
  const {params, wait, injector, defaultValue} = options;

  const state = signal<ResourceSnapshot<T | undefined>>({
    status: 'loading',
    value: defaultValue,
  });

  let active: Promise<void> | void | undefined;
  let pendingValue: T | undefined;

  (injector?.get(DestroyRef) ?? inject(DestroyRef)).onDestroy(() => {
    active = undefined;
  });

  effect(
    () => {
      // Enter error state if the source throws.
      // TODO: does this make sense?
      let value: T;
      try {
        value = params();
      } catch (err) {
        state.set({status: 'error', error: err as Error});
        active = pendingValue = undefined;
        return;
      }

      const currentState = untracked(state);

      // Check if the value is the same as the previous one.
      const equal = options.equal ?? Object.is;
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
        // Asynchronous case, change to loading or reloading state while the promise is pending.
        if (currentState.status === 'error') {
          state.set({status: 'loading', value: defaultValue});
        } else if (currentState.status !== 'loading' && currentState.status !== 'reloading') {
          state.set({status: 'reloading', value: currentState.value});
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
    {injector: injector},
  );

  return resourceFromSnapshots(state);
}
