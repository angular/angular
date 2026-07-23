/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SIGNAL} from '../../../primitives/signals';
import type {WritableSignal} from './signal';

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 *
 * @see [What are signals?](guide/signals#what-are-signals)
 *
 * @publicApi 17.0
 */
export type Signal<T> = (() => T) & {
  [SIGNAL]: unknown;
};

/**
 * Checks if the given `value` is a reactive `Signal`.
 *
 * @see [Type checking signals](guide/signals#type-checking-signals)
 *
 * @publicApi 17.0
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'function' && (value as Signal<unknown>)[SIGNAL] !== undefined;
}

/**
 * A comparison function which can determine if two values are equal.
 *
 * @see [Signal equality functions](guide/signals#signal-equality-functions)
 *
 * @publicApi 17.0
 */
export type ValueEqualityFn<T> = (a: T, b: T) => boolean;

/**
 * Checks if the given `value` is a writeable signal.
 *
 * @see [Type checking signals](guide/signals#type-checking-signals)
 *
 * @publicApi 21.1
 */
export function isWritableSignal(value: unknown): value is WritableSignal<unknown> {
  return isSignal(value) && typeof (value as any).set === 'function';
}
