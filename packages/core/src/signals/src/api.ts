/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReactiveNode} from './graph';

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
const SIGNAL = Symbol('SIGNAL');

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 *
 * @developerPreview
 */
export type Signal<T> = (() => T)&{
  [SIGNAL]: unknown;
};

/**
 * Checks if the given `value` function is a reactive `Signal`.
 */
export function isSignal(value: Function): value is Signal<unknown> {
  return (value as Signal<unknown>)[SIGNAL] !== undefined;
}

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`).
 *
 * @param fn A zero-argument function which will be converted into a `Signal`.
 */
export function createSignalFromFunction<T>(node: ReactiveNode, fn: () => T): Signal<T>;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`), and
 * potentially add some set of extra properties (passed as an object record `extraApi`).
 *
 * @param fn A zero-argument function which will be converted into a `Signal`.
 * @param extraApi An object whose properties will be copied onto `fn` in order to create a specific
 *     desired interface for the `Signal`.
 */
export function createSignalFromFunction<T, U extends Record<string, unknown>>(
    node: ReactiveNode, fn: () => T, extraApi: U): Signal<T>&U;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`), and
 * potentially add some set of extra properties (passed as an object record `extraApi`).
 */
export function createSignalFromFunction<T, U extends Record<string, unknown> = {}>(
    node: ReactiveNode, fn: () => T, extraApi: U = ({} as U)): Signal<T>&U {
  (fn as any)[SIGNAL] = node;
  // Copy properties from `extraApi` to `fn` to complete the desired API of the `Signal`.
  return Object.assign(fn, extraApi) as (Signal<T>& U);
}

/**
 * A comparison function which can determine if two values are equal.
 *
 * @developerPreview
 */
export type ValueEqualityFn<T> = (a: T, b: T) => boolean;

/**
 * The default equality function used for `signal` and `computed`, which treats objects and arrays
 * as never equal, and all other primitive values using identity semantics.
 *
 * This allows signals to hold non-primitive values (arrays, objects, other collections) and still
 * propagate change notification upon explicit mutation without identity change.
 *
 * @developerPreview
 */
export function defaultEquals<T>(a: T, b: T) {
  // `Object.is` compares two values using identity semantics which is desired behavior for
  // primitive values. If `Object.is` determines two values to be equal we need to make sure that
  // those don't represent objects (we want to make sure that 2 objects are always considered
  // "unequal"). The null check is needed for the special case of JavaScript reporting null values
  // as objects (`typeof null === 'object'`).
  return (a === null || typeof a !== 'object') && Object.is(a, b);
}
