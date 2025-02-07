/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {defaultEquals, ValueEqualityFn} from './equality';
import {
  consumerAfterComputation,
  consumerBeforeComputation,
  producerAccessed,
  producerUpdateValueVersion,
  REACTIVE_NODE,
  ReactiveNode,
  SIGNAL,
} from './graph';

/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Computed`s are both producers and consumers of reactivity.
 */
export interface ComputedNode<T> extends ReactiveNode {
  /**
   * Current value of the computation, or one of the sentinel values above (`UNSET`, `COMPUTING`,
   * `ERROR`).
   */
  value: T;

  /**
   * If `value` is `ERRORED`, the error caught from the last computation attempt which will
   * be re-thrown.
   */
  error: unknown;

  /**
   * The computation function which will produce a new value.
   */
  computation: () => T;

  equal: ValueEqualityFn<T>;
}

export type ComputedGetter<T> = (() => T) & {
  [SIGNAL]: ComputedNode<T>;
};

/**
 * Create a computed signal which derives a reactive value from an expression.
 */
export function createComputed<T>(computation: () => T): ComputedGetter<T> {
  const node: ComputedNode<T> = Object.create(COMPUTED_NODE);
  node.computation = computation;

  const computed = () => {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === ERRORED) {
      throw node.error;
    }

    return node.value;
  };
  (computed as ComputedGetter<T>)[SIGNAL] = node;
  return computed as unknown as ComputedGetter<T>;
}

/**
 * A dedicated symbol used before a computed value has been calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const UNSET: any = /* @__PURE__ */ Symbol('UNSET');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const COMPUTING: any = /* @__PURE__ */ Symbol('COMPUTING');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const ERRORED: any = /* @__PURE__ */ Symbol('ERRORED');

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const COMPUTED_NODE = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    value: UNSET,
    dirty: true,
    error: null,
    equal: defaultEquals,
    kind: 'computed',

    producerMustRecompute(node: ComputedNode<unknown>): boolean {
      // Force a recomputation if there's no current value, or if the current value is in the
      // process of being calculated (which should throw an error).
      return node.value === UNSET || node.value === COMPUTING;
    },

    producerRecomputeValue(node: ComputedNode<unknown>): void {
      if (node.value === COMPUTING) {
        // Our computation somehow led to a cyclic read of itself.
        throw new Error('Detected cycle in computations.');
      }

      const oldValue = node.value;
      node.value = COMPUTING;

      const prevConsumer = consumerBeforeComputation(node);
      let newValue: unknown;
      try {
        newValue = node.computation();
      } catch (err) {
        newValue = ERRORED;
        node.error = err;
      } finally {
        consumerAfterComputation(node, prevConsumer);
      }

      if (
        oldValue !== UNSET &&
        oldValue !== ERRORED &&
        newValue !== ERRORED &&
        node.equal(oldValue, newValue)
      ) {
        // No change to `valueVersion` - old and new values are
        // semantically equivalent.
        node.value = oldValue;
        return;
      }

      node.value = newValue;
      node.version++;
    },
  };
})();
