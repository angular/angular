/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ComputedImpl, defaultEquals, ERRORED, setActiveConsumer, signal, Signal, UNSET, WritableSignal} from '../../signals';
import {setPureFunctionsEnabled} from '../pure_function';

export const BRAND_WRITE_TYPE = Symbol();

/**
 * A `Signal` representing a component or directive input.
 *
 * This is equivalent to a `Signal`, except it also carries type information about the
 */
export type InputSignal<ReadT, WriteT> = Signal<ReadT>&{
  [BRAND_WRITE_TYPE]: WriteT;
};

/**
 * A `Signal` representing a component or directive model input.
 *
 * Model inputs also have the `WritableSignal` interface for their WriteTer side.
 */
export type ModelSignal<ReadT, WriteT> =
    InputSignal<ReadT, WriteT>&Pick<WritableSignal<WriteT>, 'set'|'update'|'mutate'>;

/**
 * Internal implementation of input signals, derived from `Computed`.
 */
export class InputSignalImpl<ReadT, WriteT> extends ComputedImpl<ReadT> {
  /**
   * Whether the input is initialized. The runtime will set this to `true` when
   * the input was set to a value or computation for the first time.
   */
  protected isInitialized = false;
  protected transform: (value: WriteT) => ReadT;

  private _inputBindingValue: WritableSignal<{
    /**
     * The computation to which the `InputSignal` is currently bound, if bound to a computation.
     */
    computation?: (() => WriteT);
    /**
     * If the `InputSignal` is not bound to a computation, then it's bound to a value.
     *
     * This might be used for an initial value, or used by Zone components binding to a
     * input signal.
     */
    value?: WriteT;
  }>;

  constructor(initialValue: WriteT|undefined, transform: ((value: WriteT) => ReadT)|null) {
    super(null!, defaultEquals);

    this._inputBindingValue = signal({value: initialValue});

    // Computation used by `ComputedImpl`.
    this.computation = this.switchedComputation.bind(this);

    if (transform !== null) {
      this.transform = (value: WriteT) => {
        const prev = setActiveConsumer(null);
        try {
          return transform(value);
        } finally {
          setActiveConsumer(prev);
        }
      };
    } else {
      this.transform = noopTransform as typeof this.transform;
    }
  }

  bindToComputation(computation: () => WriteT): void {
    this._inputBindingValue.set({computation});
    this.stale = true;
    this.producerMayHaveChanged();
  }

  bindToValue(value: WriteT): void {
    this._inputBindingValue.set({value});
    this.stale = true;
    this.producerMayHaveChanged();
  }

  initialized(): void {
    this.isInitialized = true;
  }

  protected switchedComputation(): ReadT {
    if (!this.isInitialized) {
      // TODO(alxhub): Make this a proper RuntimeError
      throw new Error(`InputSignal not yet initialized`);
    }

    const state = this._inputBindingValue();

    if (state.computation !== undefined) {
      // Disable pure function memoization when running computations of input signals.
      //
      // Bound computations are generated with instructions in place to memoize allocations like
      // object literals, or for pipe transformations. Such operations do not need to be memoized
      // in input computations as the `InputSignal` naturally memoizes the whole expression.
      const prevPureFunctionsEnabled = setPureFunctionsEnabled(false);
      try {
        return this.transform(state.computation());
      } finally {
        setPureFunctionsEnabled(prevPureFunctionsEnabled);
      }
    } else {
      // `value` is only set to `undefined` when `computation` is used, or if the current
      // value is actually assignable to `WriteT`.
      return this.transform(state.value!);
    }
  }
}

export class ModelSignalImpl<ReadT, WriteT> extends InputSignalImpl<ReadT, WriteT> {
  setTemporarily(setValue: WriteT): void {
    // Check whether the current and new values are equal.
    this.onProducerUpdateValueVersion();
    const newValue = this.transform(setValue);
    if (this.value !== UNSET && this.value !== ERRORED && this.equal(this.value, newValue)) {
      return;
    }

    this.value = newValue;
    this.error = null;
    this.valueVersion++;
    this.producerMayHaveChanged();
  }

  updateTemporarily(update: (value: ReadT) => WriteT): void {
    this.onProducerUpdateValueVersion();
    if (this.value === UNSET || this.value === ERRORED) {
      return;
    }
    this.setTemporarily(update(this.value));
  }

  mutateTemporarily(mutator: (value: ReadT) => void): void {
    this.onProducerUpdateValueVersion();
    if (this.value === ERRORED) {
      throw this.error;
    }
    mutator(this.value);
    this.valueVersion++;
    this.producerMayHaveChanged();
  }
}

function noopTransform<T>(value: T): T {
  return value;
}
