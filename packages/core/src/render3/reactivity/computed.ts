/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createComputed, SIGNAL} from '../../../primitives/signals';

import {Signal, ValueEqualityFn} from './api';

/**
 * Options passed to the `computed` creation function.
 */
export interface CreateComputedOptions<T> {
  /**
   * A comparison function which defines equality for computed values.
   */
  equal?: ValueEqualityFn<T>;

  /**
   * A debug name for the computed signal. Used in Angular DevTools to identify the signal.
   */
  debugName?: string;
}

/**
 * Create a computed `Signal` which derives a reactive value from an expression.
 */
export function computed<T>(computation: () => T, options?: CreateComputedOptions<T>): Signal<T> {
  const getter = createComputed(computation, options?.equal);

  if (ngDevMode) {
    getter.toString = () => `[Computed: ${getter()}]`;
    getter[SIGNAL].debugName = options?.debugName;
  }

  return getter;
}
