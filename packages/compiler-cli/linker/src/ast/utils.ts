/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FatalLinkerError} from '../fatal_linker_error';

/**
 * Assert that the given `node` is of the type guarded by the `predicate` function.
 */
export function assert<T, K extends T>(
  node: T,
  predicate: (node: T) => node is K,
  expected: string,
): asserts node is K {
  if (!predicate(node)) {
    throw new FatalLinkerError(node, `Unsupported syntax, expected ${expected}.`);
  }
}
