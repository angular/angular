/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SIGNAL, ɵTYPE_MARKER} from '@angular/core/primitives/signals';

/** Extracts the inner type of a Signal. */
export type SignalType<T extends SignalFn<unknown>> = T[typeof ɵTYPE_MARKER];

/** Function type definition for a `Signal`. */
export interface SignalFn<T> {
  (): SignalType<this>;
  [ɵTYPE_MARKER]: T;
}

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 */
export type Signal<T> = SignalFn<T> & { [SIGNAL]: unknown; };

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
