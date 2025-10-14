/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import { R3DependencyMetadata } from '../r3_factory';
/**
 * Creates an array literal expression from the given array, mapping all values to an expression
 * using the provided mapping function. If the array is empty or null, then null is returned.
 *
 * @param values The array to transfer into literal array expression.
 * @param mapper The logic to use for creating an expression for the array's values.
 * @returns An array literal expression representing `values`, or null if `values` is empty or
 * is itself null.
 */
export declare function toOptionalLiteralArray<T>(values: T[] | null, mapper: (value: T) => o.Expression): o.LiteralArrayExpr | null;
/**
 * Creates an object literal expression from the given object, mapping all values to an expression
 * using the provided mapping function. If the object has no keys, then null is returned.
 *
 * @param object The object to transfer into an object literal expression.
 * @param mapper The logic to use for creating an expression for the object's values.
 * @returns An object literal expression representing `object`, or null if `object` does not have
 * any keys.
 */
export declare function toOptionalLiteralMap<T>(object: {
    [key: string]: T;
}, mapper: (value: T) => o.Expression): o.LiteralMapExpr | null;
export declare function compileDependencies(deps: R3DependencyMetadata[] | 'invalid' | null): o.LiteralExpr | o.LiteralArrayExpr;
export declare function compileDependency(dep: R3DependencyMetadata): o.LiteralMapExpr;
