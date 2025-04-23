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
  ReactiveHookFn,
  runPostProducerCreatedFn,
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
let postSignalSetFn: ReactiveHookFn | null = null;

export interface SignalNode<T> extends ReactiveNode {
  value: T;
  equal: ValueEqualityFn<T>;
}

export type SignalBaseGetter<T> = (() => T) & {readonly [SIGNAL]: unknown};
type SignalSetter<T> = (newValue: T) => void;
type SignalUpdater<T> = (updateFn: (value: T) => T) => void;

// Note: Closure *requires* this to be an `interface` and not a type, which is why the
// `SignalBaseGetter` type exists to provide the correct shape.
export interface SignalGetter<T> extends SignalBaseGetter<T> {
  readonly [SIGNAL]: SignalNode<T>;
}

/**
 * Create a `Signal` that can be set or updated directly.
 */
export function createSignal<T>(initialValue: T, equal?: ValueEqualityFn<T>): SignalGetter<T> {
  const node: SignalNode<T> = Object.create(SIGNAL_NODE);
  node.value = initialValue;
  if (equal !== undefined) {
    node.equal = equal;
  }
  const getter = (() => signalGetFn(node)) as SignalGetter<T>;
  (getter as any)[SIGNAL] = node;
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[Signal${debugName}: ${node.value}]`;
  }

  runPostProducerCreatedFn(node);

  return getter;
}

/**
 * Creates a `Signal` getter, setter, and updater function.
 */
export function createSignalTuple<T>(
  initialValue: T,
  equal?: ValueEqualityFn<T>,
): [SignalGetter<T>, SignalSetter<T>, SignalUpdater<T>] {
  const getter = createSignal(initialValue, equal);
  const node = getter[SIGNAL];
  const set = (newValue: T) => signalSetFn(node, newValue);
  const update = (updateFn: (value: T) => T) => signalUpdateFn(node, updateFn);
  return [getter, set, update];
}

export function setPostSignalSetFn(fn: ReactiveHookFn | null): ReactiveHookFn | null {
  const prev = postSignalSetFn;
  postSignalSetFn = fn;
  return prev;
}

export function signalGetFn<T>(node: SignalNode<T>): T {
  producerAccessed(node);
  return node.value;
}

export function signalSetFn<T>(node: SignalNode<T>, newValue: T) {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError(node);
  }

  if (!node.equal(node.value, newValue)) {
    node.value = newValue;
    signalValueChanged(node);
  }
}

export function signalUpdateFn<T>(node: SignalNode<T>, updater: (value: T) => T): void {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError(node);
  }

  signalSetFn(node, updater(node.value));
}

export function runPostSignalSetFn<T>(node: SignalNode<T>): void {
  postSignalSetFn?.(node);
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const SIGNAL_NODE: SignalNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    equal: defaultEquals,
    value: undefined,
    kind: 'signal',
  };
})();

function signalValueChanged<T>(node: SignalNode<T>): void {
  node.version++;
  producerIncrementEpoch();
  producerNotifyConsumers(node);
  postSignalSetFn?.(node);
}
