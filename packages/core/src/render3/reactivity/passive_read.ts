/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  passiveRead as passiveReadPrimitive,
  PassiveReadResult as PassiveReadResultPrimitive,
} from '../../../primitives/signals';

/**
 * Result of a passive signal read operation.
 *
 * Indicates whether a signal has a computed value available and provides access to it.
 *
 * @publicApi
 */
export type PassiveReadResult<T> = PassiveReadResultPrimitive<T>;

/**
 * Performs a passive read of a signal without triggering its recomputation.
 *
 * This utility allows reading a signal's current value within a reactive context
 * (effect or computed) without forcing the signal to recompute if it is currently dirty.
 * The caller is still registered as a dependent, so the reactive context will re-run
 * when the signal's value changes.
 *
 * Use this when you need to conditionally observe a signal without triggering
 * expensive computations or side effects.
 *
 * @param signal The signal getter to read passively
 *
 * @see [Reading without triggering recomputation](guide/signals#reading-without-triggering-recomputation)
 * @publicApi 22.2
 */
export function passiveRead<T>(signal: () => T): PassiveReadResult<T> {
  return passiveReadPrimitive(signal);
}
