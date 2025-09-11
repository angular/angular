/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createSignal,
  SIGNAL,
  SignalGetter,
  SignalNode,
  signalSetFn,
  signalUpdateFn,
} from '../../../primitives/signals';

import {isSignal, Signal, ValueEqualityFn} from './api';
import {untracked} from './untracked';

/** Symbol used distinguish `WritableSignal` from other non-writable signals and functions. */
export const ɵWRITABLE_SIGNAL: unique symbol = /* @__PURE__ */ Symbol('WRITABLE_SIGNAL');

/**
 * A `Signal` with a value that can be mutated via a setter interface.
 *
 * @publicApi 17.0
 */
export interface WritableSignal<T> extends Signal<T> {
  [ɵWRITABLE_SIGNAL]: T;

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
   * Returns a readonly version of this signal. Readonly signals can be accessed to read their value
   * but can't be changed using set or update methods. The readonly signals do _not_ have
   * any built-in mechanism that would prevent deep-mutation of their value.
   */
  asReadonly(): Signal<T>;
}

/**
 * Utility function used during template type checking to extract the value from a `WritableSignal`.
 * @codeGenApi
 */
export function ɵunwrapWritableSignal<T>(value: T | {[ɵWRITABLE_SIGNAL]: T}): T {
  // Note: the function uses `WRITABLE_SIGNAL` as a brand instead of `WritableSignal<T>`,
  // because the latter incorrectly unwraps non-signal getter functions.
  return null!;
}

/**
 * Options passed to the `signal` creation function.
 */
export interface CreateSignalOptions<T> {
  /**
   * A comparison function which defines equality for signal values.
   */
  equal?: ValueEqualityFn<T>;

  /**
   * A debug name for the signal. Used in Angular DevTools to identify the signal.
   */
  debugName?: string;
}

/**
 * Create a `Signal` that can be set or updated directly.
 */
export function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T> {
  const [get, set, update] = createSignal(initialValue, options?.equal);

  const signalFn = get as SignalGetter<T> & WritableSignal<T>;
  const node = signalFn[SIGNAL];

  signalFn.set = set;
  signalFn.update = update;
  signalFn.asReadonly = signalAsReadonlyFn.bind(signalFn as any) as () => Signal<T>;

  if (ngDevMode) {
    signalFn.toString = () => `[Signal: ${signalFn()}]`;
    node.debugName = options?.debugName;
  }

  return signalFn as WritableSignal<T>;
}

export function signalAsReadonlyFn<T>(this: SignalGetter<T>): Signal<T> {
  const node = this[SIGNAL] as SignalNode<T> & {readonlyFn?: Signal<T>};
  if (node.readonlyFn === undefined) {
    const readonlyFn = () => this();
    (readonlyFn as any)[SIGNAL] = node;
    node.readonlyFn = readonlyFn as Signal<T>;
  }
  return node.readonlyFn;
}

/**
 * Checks if the given `value` is a writeable signal.
 */
export function isWritableSignal(value: unknown): value is WritableSignal<unknown> {
  return isSignal(value) && typeof (value as any).set === 'function';
}

/**
 * Upgrade the `read` signal to be a `WritableSignal`, using the `write` function to set the value.
 *
 * Callers must ensure that `write` updates the value of `read` in a synchronous way.
 *
 * It is an error to call `upgradeSignalToWritable` on a `WritableSignal`.
 */
export function upgradeSignalToWritable<T>(
  read: WritableSignal<T>,
  write: (value: T) => void,
): never;
export function upgradeSignalToWritable<T>(
  read: Signal<T>,
  write: (value: T) => void,
): asserts read is WritableSignal<T>;
export function upgradeSignalToWritable<T>(
  read: Signal<T>,
  write: (value: T) => void,
): asserts read is WritableSignal<T> {
  const getter = read as WritableSignal<T>;
  if (ngDevMode && (getter as {set?: unknown}).set) {
    throw new Error('Cannot upgrade an already-writable signal.');
  }

  getter.set = write;
  getter.update = (fn: (value: T) => T) => {
    write(fn(untracked(read)));
  };
  getter.asReadonly = signalAsReadonlyFn;
}
