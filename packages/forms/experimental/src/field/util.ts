/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {FieldNode} from './node';
import type {FieldNodeOptions} from './structure';

/**
 * Perform a reduction over a field's children (if any) and return the result.
 *
 * Optionally, the reduction is short circuited based on the provided `shortCircuit` function.
 */
export function reduceChildren<T>(
  node: FieldNode,
  initialValue: T,
  fn: (child: FieldNode, value: T) => T,
  shortCircuit?: (value: T) => boolean,
): T {
  const childrenMap = node.structure.childrenMap();
  if (!childrenMap) {
    return initialValue;
  }
  let value = initialValue;
  for (const child of childrenMap.values()) {
    if (shortCircuit?.(value)) {
      break;
    }
    value = fn(child, value);
  }
  return value;
}

/** A shortCircuit function for reduceChildren that short-circuits if the value is false. */
export function shortCircuitFalse(value: boolean): boolean {
  return !value;
}

/** A shortCircuit function for reduceChildren that short-circuits if the value is true. */
export function shortCircuitTrue(value: boolean): boolean {
  return value;
}

/** Recasts the given value as a new type. */
export function cast<T>(value: unknown): asserts value is T {}

/**
 * A helper method allowing to get injector regardless of the options type.
 * @param options
 */
export function getInjectorFromOptions(options: FieldNodeOptions) {
  if (options.kind === 'root') {
    return options.fieldManager.injector;
  }

  return options.parent.structure.root.structure.injector;
}
