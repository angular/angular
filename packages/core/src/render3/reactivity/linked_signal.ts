/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {signalAsReadonlyFn, WritableSignal} from './signal';
import {Signal, ValueEqualityFn} from './api';
import {
  producerMarkClean,
  ReactiveNode,
  SIGNAL,
  signalSetFn,
  signalUpdateFn,
  producerUpdateValueVersion,
  REACTIVE_NODE,
  defaultEquals,
  consumerBeforeComputation,
  consumerAfterComputation,
  producerAccessed,
} from '@angular/core/primitives/signals';
import {performanceMarkFeature} from '../../util/performance';

type ComputationFn<S, D> = (source: S, previous?: {source: S; value: D}) => D;

interface LinkedSignalNode<S, D> extends ReactiveNode {
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

const identityFn = <T>(v: T) => v;

/**
 * Create a linked signal which represents state that is (re)set from a linked reactive expression.
 */
function createLinkedSignal<S, D>(node: LinkedSignalNode<S, D>): WritableSignal<D> {
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

  const getter = linkedSignalGetter as LinkedSignalGetter<S, D> & WritableSignal<D>;
  getter[SIGNAL] = node;

  if (ngDevMode) {
    getter.toString = () => `[LinkedSignal: ${getter()}]`;
  }

  getter.set = (newValue: D) => {
    producerUpdateValueVersion(node);
    signalSetFn(node, newValue);
    producerMarkClean(node);
  };

  getter.update = (updateFn: (value: D) => D) => {
    producerUpdateValueVersion(node);
    signalUpdateFn(node, updateFn);
    producerMarkClean(node);
  };

  getter.asReadonly = signalAsReadonlyFn.bind(getter as any) as () => Signal<D>;

  return getter;
}

/**
 * Creates a writable signals whose value is initialized and reset by the linked, reactive computation.
 *
 * @developerPreview
 */
export function linkedSignal<D>(
  computation: () => D,
  options?: {equal?: ValueEqualityFn<NoInfer<D>>},
): WritableSignal<D>;

/**
 * Creates a writable signals whose value is initialized and reset by the linked, reactive computation.
 * This is an advanced API form where the computation has access to the previous value of the signal and the computation result.
 *
 * @developerPreview
 */
export function linkedSignal<S, D>(options: {
  source: () => S;
  computation: (source: NoInfer<S>, previous?: {source: NoInfer<S>; value: NoInfer<D>}) => D;
  equal?: ValueEqualityFn<NoInfer<D>>;
}): WritableSignal<D>;
export function linkedSignal<S, D>(
  optionsOrComputation:
    | {
        source: () => S;
        computation: ComputationFn<S, D>;
        equal?: ValueEqualityFn<D>;
      }
    | (() => D),
  options?: {equal?: ValueEqualityFn<D>},
): WritableSignal<D> {
  performanceMarkFeature('NgSignals');

  const isShorthand = typeof optionsOrComputation === 'function';
  const node: LinkedSignalNode<unknown, unknown> = Object.create(LINKED_SIGNAL_NODE);
  node.source = isShorthand ? optionsOrComputation : optionsOrComputation.source;
  if (!isShorthand) {
    node.computation = optionsOrComputation.computation as ComputationFn<unknown, unknown>;
  }
  const equal = isShorthand ? options?.equal : optionsOrComputation.equal;
  if (equal) {
    node.equal = equal as ValueEqualityFn<unknown>;
  }
  return createLinkedSignal(node as LinkedSignalNode<S, D>);
}

/**
 * A dedicated symbol used before a state value has been set / calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const UNSET: any = /* @__PURE__ */ Symbol('UNSET');

/**
 * A dedicated symbol used in place of a linked signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const COMPUTING: any = /* @__PURE__ */ Symbol('COMPUTING');

/**
 * A dedicated symbol used in place of a linked signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again or the state is set.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const ERRORED: any = /* @__PURE__ */ Symbol('ERRORED');

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `LINKED_SIGNAL_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const LINKED_SIGNAL_NODE = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    value: UNSET,
    dirty: true,
    error: null,
    equal: defaultEquals,
    computation: identityFn,

    producerMustRecompute(node: LinkedSignalNode<unknown, unknown>): boolean {
      // Force a recomputation if there's no current value, or if the current value is in the
      // process of being calculated (which should throw an error).
      return node.value === UNSET || node.value === COMPUTING;
    },

    producerRecomputeValue(node: LinkedSignalNode<unknown, unknown>): void {
      if (node.value === COMPUTING) {
        // Our computation somehow led to a cyclic read of itself.
        throw new Error('Detected cycle in computations.');
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
