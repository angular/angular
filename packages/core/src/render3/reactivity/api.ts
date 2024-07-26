/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SIGNAL} from '@angular/core/primitives/signals';

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 */
export type Signal<T> = (() => T) & {
  [SIGNAL]: unknown;

  /**
   * We trick the compiler into thinking that the `length` property is never available on a Signal.
   * This way we ensure that a signal wrapping an array, would never end up being treated as an array
   * ex: `mySignal.length` that should have been a `mySignal().length`
   */
  length(): never;
};

/**
 * Checks if the given `value` is a reactive `Signal`.
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'function' && (value as Signal<unknown>)[SIGNAL] !== undefined;
}

/**
 * A comparison function which can determine if two values are equal.
 */
export type ValueEqualityFn<T> = (a: T, b: T) => boolean;
