/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Unwraps a given expression TypeScript node. Expressions can be wrapped within multiple
 * parentheses. e.g. "(((({exp}))))()". The function should return the TypeScript node
 * referring to the inner expression. e.g "exp".
 */
export function unwrapExpression(node: ts.Expression|ts.ParenthesizedExpression): ts.Expression {
  return ts.isParenthesizedExpression(node) ? unwrapExpression(node.expression) : node;
}
