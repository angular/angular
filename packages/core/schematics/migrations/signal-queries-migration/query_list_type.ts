/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Extracts the type `T` of expressions referencing `QueryList<T>`.
 */
export function extractQueryListType(node: ts.TypeNode | ts.Expression): ts.TypeNode | undefined {
  // Initializer variant of `new QueryList<T>()`.
  if (
    ts.isNewExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'QueryList'
  ) {
    return node.typeArguments?.[0];
  }

  // Type variant of `: QueryList<T>`.
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    node.typeName.text === 'QueryList'
  ) {
    return node.typeArguments?.[0];
  }

  return undefined;
}
