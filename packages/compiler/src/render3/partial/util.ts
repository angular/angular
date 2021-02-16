/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';

/**
 * Creates an array literal expression from the given array, mapping all values to an expression
 * using the provided mapping function. If the array is empty or null, then null is returned.
 *
 * @param values The array to transfer into literal array expression.
 * @param mapper The logic to use for creating an expression for the array's values.
 * @returns An array literal expression representing `values`, or null if `values` is empty or
 * is itself null.
 */
export function toOptionalLiteralArray<T>(
    values: T[]|null, mapper: (value: T) => o.Expression): o.LiteralArrayExpr|null {
  if (values === null || values.length === 0) {
    return null;
  }
  return o.literalArr(values.map(value => mapper(value)));
}

/**
 * Creates an object literal expression from the given object, mapping all values to an expression
 * using the provided mapping function. If the object has no keys, then null is returned.
 *
 * @param object The object to transfer into an object literal expression.
 * @param mapper The logic to use for creating an expression for the object's values.
 * @returns An object literal expression representing `object`, or null if `object` does not have
 * any keys.
 */
export function toOptionalLiteralMap<T>(
    object: {[key: string]: T}, mapper: (value: T) => o.Expression): o.LiteralMapExpr|null {
  const entries = Object.keys(object).map(key => {
    const value = object[key];
    return {key, value: mapper(value), quoted: true};
  });

  if (entries.length > 0) {
    return o.literalMap(entries);
  } else {
    return null;
  }
}
