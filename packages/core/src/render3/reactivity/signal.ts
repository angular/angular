/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createSignal, SIGNAL, SignalGetter, SignalNode, signalSetFn, signalUpdateFn} from '@angular/core/primitives/signals';

import {performanceMarkFeature} from '../../util/performance';

import {isSignal, Signal, ValueEqualityFn} from './api';

/** Symbol used distinguish `WritableSignal` from other non-writable signals and functions. */
const WRITABLE_SIGNAL = /* @__PURE__ */ Symbol('WRITABLE_SIGNAL');

/**
 * A `Signal` with a value that can be mutated via a setter interface.
 */
export interface WritableSignal<T> extends Signal<T> {
  [WRITABLE_SIGNAL]: T;

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
export function ɵunwrapWritableSignal<T>(value: T|{[WRITABLE_SIGNAL]: T}): T {
  // Note: needs to be kept in sync with the copy in `fake_core/index.ts`.
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
}

/**
 * Create a `Signal` that can be set or updated directly.
 */
export function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T> {
  performanceMarkFeature('NgSignals');
  const signalFn = createSignal(initialValue) as SignalGetter<T>& WritableSignal<T>;
  const node = signalFn[SIGNAL];
  if (options?.equal) {
    node.equal = options.equal;
  }

  signalFn.set = (newValue: T) => signalSetFn(node, newValue);
  signalFn.update = (updateFn: (value: T) => T) => signalUpdateFn(node, updateFn);
  signalFn.asReadonly = signalAsReadonlyFn.bind(signalFn as any) as () => Signal<T>;
  if (ngDevMode) {
    signalFn.toString = () => `[Signal: ${signalFn()}]`;
  }
  return signalFn as WritableSignal<T>;
}

function signalAsReadonlyFn<T>(this: SignalGetter<T>): Signal<T> {
  const node = this[SIGNAL] as SignalNode<T>& {readonlyFn?: Signal<T>};
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
