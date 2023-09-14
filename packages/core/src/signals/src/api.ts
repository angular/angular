/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
export const SIGNAL = /* @__PURE__ */ Symbol('SIGNAL');

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
 * Checks if the given `value` is a reactive `Signal`.
 *
 * @developerPreview
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'function' && (value as Signal<unknown>)[SIGNAL] !== undefined;
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
