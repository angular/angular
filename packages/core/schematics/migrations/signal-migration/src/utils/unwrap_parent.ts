/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Unwraps the parent of the given node, if it's a
 * parenthesized expression or `as` expression.
 */
export function unwrapParent(node: ts.Node): ts.Node {
  if (ts.isParenthesizedExpression(node.parent)) {
    return unwrapParent(node.parent);
  } else if (ts.isAsExpression(node.parent)) {
    return unwrapParent(node.parent);
  }
  return node;
}
