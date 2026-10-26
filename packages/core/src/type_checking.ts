/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Signal} from './render3/reactivity/api';

/**
 * Utility function used during template type checking to assert that a value is of a certain type.
 * @codeGenApi
 */
export function ɵassertType<T>(value: unknown): asserts value is T {}

/**
 * Utility function used during template type checking to assert that an expression is not an
 * uninvoked `Signal`.
 * @codeGenApi
 */
export function ɵassertNotSignal<T>(
  id: number,
  value: T &
    ([T] extends [never]
      ? unknown
      : 0 extends 1 & T
        ? unknown
        : [T] extends [Signal<unknown>]
          ? never
          : unknown),
): void {}

/**
 * Utility function used during template type checking to assert that an expression is not an
 * uninvoked function.
 * @codeGenApi
 */
export function ɵassertNotCallable<T>(
  id: number,
  value: T &
    ([T] extends [never]
      ? unknown
      : 0 extends 1 & T
        ? unknown
        : [T] extends [(this: never, ...args: never[]) => unknown]
          ? never
          : unknown),
): void {}

/**
 * Utility function used during template type checking to assert that a `@for` track expression is
 * not an uninvoked `TrackByFunction` (requiring at least one argument), while allowing 0-argument
 * callable values such as Signal Forms `Field<T>`.
 * @codeGenApi
 */
export function ɵassertNotTrackCallable<T>(
  id: number,
  value: T &
    ([T] extends [never]
      ? unknown
      : 0 extends 1 & T
        ? unknown
        : [T] extends [(this: never, ...args: infer P) => unknown]
          ? [P] extends [[]]
            ? unknown
            : never
          : unknown),
): void {}
