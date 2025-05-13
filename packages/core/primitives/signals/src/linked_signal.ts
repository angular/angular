/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {COMPUTING, ERRORED, UNSET} from './computed';
import {defaultEquals, ValueEqualityFn} from './equality';
import {
  consumerAfterComputation,
  consumerBeforeComputation,
  producerAccessed,
  producerMarkClean,
  producerUpdateValueVersion,
  REACTIVE_NODE,
  ReactiveNode,
  runPostProducerCreatedFn,
  SIGNAL,
} from './graph';
import {signalSetFn, signalUpdateFn} from './signal';

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

export type ComputationFn<S, D> = (source: S, previous?: {source: S; value: D}) => D;

export interface LinkedSignalNode<S, D> extends ReactiveNode {
  /**
   * Value of the source signal that was used to derive the computed value.
   */
  sourceValue: S;

  /**
   * Current state value, or one of the sentinel values (`UNSET`, `COMPUTING`,
   * `ERROR`).
   */
  value: D;

  /**
   * If `value` is `ERRORED`, the error caught from the last computation attempt which will
   * be re-thrown.
   */
  error: unknown;

  /**
   * The source function represents reactive dependency based on which the linked state is reset.
   */
  source: () => S;

  /**
   * The computation function which will produce a new value based on the source and, optionally - previous values.
   */
  computation: ComputationFn<S, D>;

  equal: ValueEqualityFn<D>;
}

export type LinkedSignalGetter<S, D> = (() => D) & {
  [SIGNAL]: LinkedSignalNode<S, D>;
};

export function createLinkedSignal<S, D>(
  sourceFn: () => S,
  computationFn: ComputationFn<S, D>,
  equalityFn?: ValueEqualityFn<D>,
): LinkedSignalGetter<S, D> {
  const node: LinkedSignalNode<S, D> = Object.create(LINKED_SIGNAL_NODE);

  node.source = sourceFn;
  node.computation = computationFn;
  if (equalityFn != undefined) {
    node.equal = equalityFn;
  }

  const linkedSignalGetter = () => {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === ERRORED) {
      throw node.error;
    }

    return node.value;
  };

  const getter = linkedSignalGetter as LinkedSignalGetter<S, D>;
  getter[SIGNAL] = node;
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[LinkedSignal${debugName}: ${node.value}]`;
  }

  runPostProducerCreatedFn(node);

  return getter;
}

export function linkedSignalSetFn<S, D>(node: LinkedSignalNode<S, D>, newValue: D) {
  producerUpdateValueVersion(node);
  signalSetFn(node, newValue);
  producerMarkClean(node);
}

export function linkedSignalUpdateFn<S, D>(
  node: LinkedSignalNode<S, D>,
  updater: (value: D) => D,
): void {
  producerUpdateValueVersion(node);
  signalUpdateFn(node, updater);
  producerMarkClean(node);
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `LINKED_SIGNAL_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const LINKED_SIGNAL_NODE: object = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    value: UNSET,
    dirty: true,
    error: null,
    equal: defaultEquals,
    kind: 'linkedSignal',

    producerMustRecompute(node: LinkedSignalNode<unknown, unknown>): boolean {
      // Force a recomputation if there's no current value, or if the current value is in the
      // process of being calculated (which should throw an error).
      return node.value === UNSET || node.value === COMPUTING;
    },

    producerRecomputeValue(node: LinkedSignalNode<unknown, unknown>): void {
      if (node.value === COMPUTING) {
        // Our computation somehow led to a cyclic read of itself.
        throw new Error(
          typeof ngDevMode !== 'undefined' && ngDevMode ? 'Detected cycle in computations.' : '',
        );
      }

      const oldValue = node.value;
      node.value = COMPUTING;

      const prevConsumer = consumerBeforeComputation(node);
      let newValue: unknown;
      try {
        const newSourceValue = node.source();
        const prev =
          oldValue === UNSET || oldValue === ERRORED
            ? undefined
            : {
                source: node.sourceValue,
                value: oldValue,
              };
        newValue = node.computation(newSourceValue, prev);
        node.sourceValue = newSourceValue;
      } catch (err) {
        newValue = ERRORED;
        node.error = err;
      } finally {
        consumerAfterComputation(node, prevConsumer);
      }

      if (oldValue !== UNSET && newValue !== ERRORED && node.equal(oldValue, newValue)) {
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
