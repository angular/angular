/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createSignal, SIGNAL, SignalGetter, SignalNode} from '../../../primitives/signals';

import {isSignal, Signal, ValueEqualityFn} from './api';

/**
 * Creates a signal of type `T` with an initial value of `undefined`.
 * Angular will implicitly use `undefined` as initial value.
 */
export function signal<T>(): WritableSignal<T | undefined>;

/**
 * Creates a signal of type `T` with an explicit initial value.
 */
export function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T>;

/**
 * Creates a signal of type `T|undefined` with undefined initial value and options.
 */
export function signal<T>(
  initialValue: undefined,
  options?: CreateSignalOptions<T | undefined>,
): WritableSignal<T | undefined>;

/**
 * Create a `Signal` that can be set or updated directly.
 *
 * The function supports creating signals with or without initial values:
 *
 *   1. **Signals with initial values** - explicitly provided values.
 *   2. **Signals without initial values** - implicitly `undefined`.
 *
 * @usageNotes
 * To use signals, import `signal` from `@angular/core`.
 *
 * ```ts
 * import {signal} from '@angular/core';
 * ```
 *
 * Create signals with different initialization patterns:
 *
 * ```ts
 * @Component({
 *   ...
 * })
 * export class MyComponent {
 *   count = signal<number>();          // WritableSignal<number | undefined>
 *   name = signal('Angular');          // WritableSignal<string>
 *   data = signal<string>(undefined);  // WritableSignal<string | undefined>
 * }
 * ```
 *
 * @publicApi
 */
export function signal<T>(
  initialValue?: T,
  options?: CreateSignalOptions<T>,
): WritableSignal<T> | WritableSignal<T | undefined> {
  const [get, set, update] = createSignal(initialValue!, options?.equal);

  const signalFn = get as SignalGetter<T> & WritableSignal<T>;
  const node = signalFn[SIGNAL];

  signalFn.set = set;
  signalFn.update = update;
  signalFn.asReadonly = signalAsReadonlyFn.bind(signalFn as any) as () => Signal<T>;

  if (ngDevMode) {
    signalFn.toString = () => `[Signal: ${signalFn()}]`;
    node.debugName = options?.debugName;
  }

  return signalFn;
}

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
