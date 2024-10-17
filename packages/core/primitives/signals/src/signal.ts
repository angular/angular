/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {defaultEquals, ValueEqualityFn} from './equality';
import {throwInvalidWriteToSignalError} from './errors';
import {
  producerAccessed,
  producerIncrementEpoch,
  producerNotifyConsumers,
  producerUpdatesAllowed,
  REACTIVE_NODE,
  ReactiveNode,
  SIGNAL,
} from './graph';

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

/**
 * If set, called after `WritableSignal`s are updated.
 *
 * This hook can be used to achieve various effects, such as running effects synchronously as part
 * of setting a signal.
 */
let postSignalSetFn: (() => void) | null = null;

export interface SignalNode<T> extends ReactiveNode {
  value: T;
  equal: ValueEqualityFn<T>;
}

export type SignalBaseGetter<T> = (() => T) & {readonly [SIGNAL]: unknown};

// Note: Closure *requires* this to be an `interface` and not a type, which is why the
// `SignalBaseGetter` type exists to provide the correct shape.
export interface SignalGetter<T> extends SignalBaseGetter<T> {
  readonly [SIGNAL]: SignalNode<T>;
}

/**
 * Create a `Signal` that can be set or updated directly.
 */
export function createSignal<T>(initialValue: T): SignalGetter<T> {
  const node: SignalNode<T> = Object.create(SIGNAL_NODE);
  node.value = initialValue;
  const getter = (() => {
    producerAccessed(node);
    return node.value;
  }) as SignalGetter<T>;
  (getter as any)[SIGNAL] = node;
  return getter;
}

export function setPostSignalSetFn(fn: (() => void) | null): (() => void) | null {
  const prev = postSignalSetFn;
  postSignalSetFn = fn;
  return prev;
}

export function signalSetFn<T>(node: SignalNode<T>, newValue: T) {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError();
  }

  if (!node.equal(node.value, newValue)) {
    node.value = newValue;
    signalValueChanged(node);
  }
}

export function signalUpdateFn<T>(node: SignalNode<T>, updater: (value: T) => T): void {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError();
  }

  signalSetFn(node, updater(node.value));
}

export function runPostSignalSetFn(): void {
  postSignalSetFn?.();
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const SIGNAL_NODE: SignalNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    equal: defaultEquals,
    value: undefined,
  };
})();

function signalValueChanged<T>(node: SignalNode<T>): void {
  node.version++;
  producerIncrementEpoch();
  producerNotifyConsumers(node);
  postSignalSetFn?.();
}
