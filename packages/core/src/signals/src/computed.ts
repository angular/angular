/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createSignalFromFunction, defaultEquals, Signal, ValueEqualityFn} from './api';
import {Consumer, ConsumerId, consumerPollValueStatus, Edge, nextReactiveId, Producer, producerAccessed, ProducerId, producerNotifyConsumers, setActiveConsumer} from './graph';
import {WeakRef} from './weak_ref';

/**
 * Create a computed `Signal` which derives a reactive value from an expression.
 *
 * @developerPreview
 */
export function computed<T>(
    computation: () => T, equal: ValueEqualityFn<T> = defaultEquals): Signal<T> {
  const node = new ComputedImpl(computation, equal);
  return createSignalFromFunction(node.signal.bind(node));
}

/**
 * A dedicated symbol used before a computed value has been calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const UNSET: any = Symbol('UNSET');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const COMPUTING: any = Symbol('COMPUTING');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const ERRORED: any = Symbol('ERRORED');

/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Computed`s are both `Producer`s and `Consumer`s of reactivity.
 */
class ComputedImpl<T> implements Producer, Consumer {
  /**
   * Current value of the computation.
   *
   * This can also be one of the special values `UNSET`, `COMPUTING`, or `ERRORED`.
   */
  private value: T = UNSET;

  /**
   * If `value` is `ERRORED`, the error caught from the last computation attempt which will
   * be re-thrown.
   */
  private error: unknown = null;

  /**
   * Flag indicating that the computation is currently stale, meaning that one of the
   * dependencies has notified of a potential change.
   *
   * It's possible that no dependency has _actually_ changed, in which case the `stale`
   * state can be resolved without recomputing the value.
   */
  private stale = true;

  readonly id = nextReactiveId();
  readonly ref = new WeakRef(this);
  readonly producers = new Map<ProducerId, Edge>();
  readonly consumers = new Map<ConsumerId, Edge>();
  trackingVersion = 0;
  valueVersion = 0;

  constructor(private computation: () => T, private equal: (oldValue: T, newValue: T) => boolean) {}

  checkForChangedValue(): void {
    if (!this.stale) {
      // The current value and its version are already up to date.
      return;
    }

    // The current value is stale. Check whether we need to produce a new one.

    if (this.value !== UNSET && this.value !== COMPUTING && !consumerPollValueStatus(this)) {
      // Even though we were previously notified of a potential dependency update, all of
      // our dependencies report that they have not actually changed in value, so we can
      // resolve the stale state without needing to recompute the current value.
      this.stale = false;
      return;
    }

    // The current value is stale, and needs to be recomputed. It still may not change -
    // that depends on whether the newly computed value is equal to the old.
    this.recomputeValue();
  }

  private recomputeValue(): void {
    if (this.value === COMPUTING) {
      // Our computation somehow led to a cyclic read of itself.
      throw new Error('Detected cycle in computations.');
    }

    const oldValue = this.value;
    this.value = COMPUTING;

    // As we're re-running the computation, update our dependent tracking version number.
    this.trackingVersion++;
    const prevConsumer = setActiveConsumer(this);
    let newValue: T;
    try {
      newValue = this.computation();
    } catch (err) {
      newValue = ERRORED;
      this.error = err;
    } finally {
      setActiveConsumer(prevConsumer);
    }

    this.stale = false;

    if (oldValue !== UNSET && oldValue !== ERRORED && newValue !== ERRORED &&
        this.equal(oldValue, newValue)) {
      // No change to `valueVersion` - old and new values are
      // semantically equivalent.
      this.value = oldValue;
      return;
    }

    this.value = newValue;
    this.valueVersion++;
  }

  notify(): void {
    if (this.stale) {
      // We've already notified consumers that this value has potentially changed.
      return;
    }

    // Record that the currently cached value may be stale.
    this.stale = true;

    // Notify any consumers about the potential change.
    producerNotifyConsumers(this);
  }

  signal(): T {
    // Check if the value needs updating before returning it.
    this.checkForChangedValue();

    // Record that someone looked at this signal.
    producerAccessed(this);

    if (this.value === ERRORED) {
      throw this.error;
    }

    return this.value;
  }
}
