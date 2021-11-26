/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

/**
 * Require that at least one of the specified properties of a type are not null/undefined.
 *
 * For example, given a type `T` of the form `Record<'foo' | 'bar' | 'baz', number | null>`, you can
 * specify that at least one of the properties `foo` and `bar` will be a number with
 * `RequireAtLeastOneNonNullable<T, 'foo' | 'bar'>`. This would be essentially equivalent with:
 *
 * ```ts
 * {
 *   foo: number;
 *   bar: number | null;
 *   baz: number | null;
 * } | {
 *   foo: number | null;
 *   bar: number;
 *   baz: number | null;
 * }
 * ```
 */
export type RequireAtLeastOneNonNullable<T, Props extends keyof T> = {
  [P in Props]: {[K in P]: NonNullable<T[P]>}&Omit<T, P>;
}[Props];

export function stripParentheses(node: ts.Node): ts.Node {
  return ts.isParenthesizedExpression(node) ? node.expression : node;
}
