/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createSignalFromFunction, DeepReadonly, defaultEquals, Signal, ValueEqualityFn} from './api';
import {ConsumerId, Edge, nextReactiveId, Producer, producerAccessed, producerNotifyConsumers} from './graph';
import {newWeakRef} from './weak_ref';

/**
 * A `Signal` with a value that can be mutated via a setter interface.
 *
 * @developerPreview
 */
export interface WritableSignal<T> extends Signal<T> {
  /**
   * Directly set the signal to a new value, and notify any dependents.
   */
  set(value: T): void;

  /**
   * Update the value of the signal based on its current value, and
   * notify any dependents.
   */
  update(updateFn: (value: T) => T): void;

  /**
   * Update the current value by mutating it in-place, and
   * notify any dependents.
   */
  mutate(mutatorFn: (value: T) => void): void;
}

/**
 * Backing type for a `WritableSignal`, a mutable reactive value.
 */
class WritableSignalImpl<T> implements Producer {
  constructor(private value: T, private equal: ValueEqualityFn<T>) {}

  readonly id = nextReactiveId();
  readonly ref = newWeakRef(this);
  readonly consumers = new Map<ConsumerId, Edge>();
  valueVersion = 0;

  checkForChangedValue(): void {
    // Writable signals can only change when set, so there's nothing to check here.
  }

  /**
   * Directly update the value of the signal to a new value, which may or may not be
   * equal to the previous.
   *
   * In the event that `newValue` is semantically equal to the current value, `set` is
   * a no-op.
   */
  set(newValue: T): void {
    if (!this.equal(this.value, newValue)) {
      this.value = newValue;
      this.valueVersion++;
      producerNotifyConsumers(this);
    }
  }

  /**
   * Derive a new value for the signal from its current value using the `updater` function.
   *
   * This is equivalent to calling `set` on the result of running `updater` on the current
   * value.
   */
  update(updater: (value: T) => T): void {
    this.set(updater(this.value));
  }

  /**
   * Calls `mutator` on the current value and assumes that it has been mutated.
   */
  mutate(mutator: (value: T) => void): void {
    // Mutate bypasses equality checks as it's by definition changing the value.
    mutator(this.value);
    this.valueVersion++;
    producerNotifyConsumers(this);
  }

  signal(): DeepReadonly<T> {
    producerAccessed(this);
    return this.value as unknown as DeepReadonly<T>;
  }
}

/**
 * Options passed to the `signal` creation function.
 *
 * @developerPreview
 */
export interface CreateSignalOptions<T> {
  /**
   * A comparison function which defines equality for signal values.
   */
  equal?: ValueEqualityFn<T>;
}

/**
 * Create a `Signal` that can be set or updated directly.
 *
 * @developerPreview
 */
export function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T> {
  const signalNode = new WritableSignalImpl(initialValue, options?.equal ?? defaultEquals);
  // Casting here is required for g3, as TS inference behavior is slightly different between our
  // version/options and g3's.
  const signalFn = createSignalFromFunction(signalNode.signal.bind(signalNode), {
                     set: signalNode.set.bind(signalNode),
                     update: signalNode.update.bind(signalNode),
                     mutate: signalNode.mutate.bind(signalNode),
                   }) as unknown as WritableSignal<T>;
  return signalFn;
}
