/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Whether the given node represents a control flow container boundary.
 * E.g. variables cannot be narrowed when descending into children of `node`.
 */
export function isControlFlowBoundary(node: ts.Node): boolean {
  return (
    (ts.isFunctionLike(node) && !getImmediatelyInvokedFunctionExpression(node)) ||
    node.kind === ts.SyntaxKind.ModuleBlock ||
    node.kind === ts.SyntaxKind.SourceFile ||
    node.kind === ts.SyntaxKind.PropertyDeclaration
  );
}

/** Determines the current flow container of a given node. */
export function getControlFlowContainer(node: ts.Node): ts.Node {
  return ts.findAncestor(node.parent, (node) => isControlFlowBoundary(node))!;
}

/** Checks whether the given node refers to an IIFE declaration. */
function getImmediatelyInvokedFunctionExpression(func: ts.Node): ts.CallExpression | undefined {
  if (func.kind === ts.SyntaxKind.FunctionExpression || func.kind === ts.SyntaxKind.ArrowFunction) {
    let prev = func;
    let parent = func.parent;
    while (parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
      prev = parent;
      parent = parent.parent;
    }
    if (
      parent.kind === ts.SyntaxKind.CallExpression &&
      (parent as ts.CallExpression).expression === prev
    ) {
      return parent as ts.CallExpression;
    }
  }
  return undefined;
}
