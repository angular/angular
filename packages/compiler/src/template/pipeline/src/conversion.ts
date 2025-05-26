/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../output/output_ast';
import * as ir from '../ir';

export const BINARY_OPERATORS = new Map([
  ['&&', o.BinaryOperator.And],
  ['>', o.BinaryOperator.Bigger],
  ['>=', o.BinaryOperator.BiggerEquals],
  ['|', o.BinaryOperator.BitwiseOr],
  ['&', o.BinaryOperator.BitwiseAnd],
  ['/', o.BinaryOperator.Divide],
  ['=', o.BinaryOperator.Assign],
  ['==', o.BinaryOperator.Equals],
  ['===', o.BinaryOperator.Identical],
  ['<', o.BinaryOperator.Lower],
  ['<=', o.BinaryOperator.LowerEquals],
  ['-', o.BinaryOperator.Minus],
  ['%', o.BinaryOperator.Modulo],
  ['**', o.BinaryOperator.Exponentiation],
  ['*', o.BinaryOperator.Multiply],
  ['!=', o.BinaryOperator.NotEquals],
  ['!==', o.BinaryOperator.NotIdentical],
  ['??', o.BinaryOperator.NullishCoalesce],
  ['||', o.BinaryOperator.Or],
  ['+', o.BinaryOperator.Plus],
  ['in', o.BinaryOperator.In],
]);

export function namespaceForKey(namespacePrefixKey: string | null): ir.Namespace {
  const NAMESPACES = new Map([
    ['svg', ir.Namespace.SVG],
    ['math', ir.Namespace.Math],
  ]);
  if (namespacePrefixKey === null) {
    return ir.Namespace.HTML;
  }
  return NAMESPACES.get(namespacePrefixKey) ?? ir.Namespace.HTML;
}

export function keyForNamespace(namespace: ir.Namespace): string | null {
  const NAMESPACES = new Map([
    ['svg', ir.Namespace.SVG],
    ['math', ir.Namespace.Math],
  ]);
  for (const [k, n] of NAMESPACES.entries()) {
    if (n === namespace) {
      return k;
    }
  }
  return null; // No namespace prefix for HTML
}

export function prefixWithNamespace(strippedTag: string, namespace: ir.Namespace): string {
  if (namespace === ir.Namespace.HTML) {
    return strippedTag;
  }
  return `:${keyForNamespace(namespace)}:${strippedTag}`;
}

export type LiteralType = string | number | boolean | null | Array<LiteralType>;

export function literalOrArrayLiteral(value: LiteralType): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(literalOrArrayLiteral));
  }
  return o.literal(value);
}
