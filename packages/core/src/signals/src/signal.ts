/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defaultEquals, SIGNAL, Signal, ValueEqualityFn} from './api';
import {throwInvalidWriteToSignalError} from './errors';
import {producerAccessed, producerNotifyConsumers, producerUpdatesAllowed, REACTIVE_NODE, ReactiveNode,} from './graph';

/**
 * If set, called after `WritableSignal`s are updated.
 *
 * This hook can be used to achieve various effects, such as running effects synchronously as part
 * of setting a signal.
 */
let postSignalSetFn: (() => void)|null = null;

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

  /**
   * Returns a readonly version of this signal. Readonly signals can be accessed to read their value
   * but can't be changed using set, update or mutate methods. The readonly signals do _not_ have
   * any built-in mechanism that would prevent deep-mutation of their value.
   */
  asReadonly(): Signal<T>;
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
  const node: SignalNode<T> = Object.create(SIGNAL_NODE);
  node.value = initialValue;
  options?.equal && (node.equal = options.equal);

  function signalFn() {
    producerAccessed(node);
    return node.value;
  }

  signalFn.set = signalSetFn;
  signalFn.update = signalUpdateFn;
  signalFn.mutate = signalMutateFn;
  signalFn.asReadonly = signalAsReadonlyFn;
  (signalFn as any)[SIGNAL] = node;

  return signalFn as WritableSignal<T>;
}

export function setPostSignalSetFn(fn: (() => void)|null): (() => void)|null {
  const prev = postSignalSetFn;
  postSignalSetFn = fn;
  return prev;
}

interface SignalNode<T> extends ReactiveNode {
  value: T;
  equal: ValueEqualityFn<T>;
  readonlyFn: Signal<T>|null;
}

interface SignalFn<T> extends Signal<T> {
  [SIGNAL]: SignalNode<T>;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const SIGNAL_NODE = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    equal: defaultEquals,
    readonlyFn: undefined,
  };
})();

function signalValueChanged<T>(node: SignalNode<T>): void {
  node.version++;
  producerNotifyConsumers(node);

  postSignalSetFn?.();
}

function signalSetFn<T>(this: SignalFn<T>, newValue: T) {
  const node = this[SIGNAL];
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError();
  }

  if (!node.equal(node.value, newValue)) {
    node.value = newValue;
    signalValueChanged(node);
  }
}

function signalUpdateFn<T>(this: SignalFn<T>, updater: (value: T) => T): void {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError();
  }

  signalSetFn.call(this as any, updater(this[SIGNAL].value) as any);
}

function signalMutateFn<T>(this: SignalFn<T>, mutator: (value: T) => void): void {
  const node = this[SIGNAL];
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError();
  }
  // Mutate bypasses equality checks as it's by definition changing the value.
  mutator(node.value);
  signalValueChanged(node);
}

function signalAsReadonlyFn<T>(this: SignalFn<T>) {
  const node = this[SIGNAL];
  if (node.readonlyFn === undefined) {
    const readonlyFn = () => this();
    (readonlyFn as any)[SIGNAL] = node;
    node.readonlyFn = readonlyFn as Signal<T>;
  }
  return node.readonlyFn;
}
