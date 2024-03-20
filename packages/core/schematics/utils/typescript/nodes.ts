/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Checks whether the given TypeScript node has the specified modifier set. */
export function hasModifier(node: ts.Node, modifierKind: ts.SyntaxKind) {
  return ts.canHaveModifiers(node) && !!node.modifiers &&
      node.modifiers.some(m => m.kind === modifierKind);
}

/** Find the closest parent node of a particular kind. */
export function closestNode<T extends ts.Node>(node: ts.Node, predicate: (n: ts.Node) => n is T): T|
    null {
  let current = node.parent;

  while (current && !ts.isSourceFile(current)) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }

  return null;
}

/**
 * Checks whether a particular node is part of a null check. E.g. given:
 * `foo.bar ? foo.bar.value : null` the null check would be `foo.bar`.
 */
export function isNullCheck(node: ts.Node): boolean {
  if (!node.parent) {
    return false;
  }

  // `foo.bar && foo.bar.value` where `node` is `foo.bar`.
  if (ts.isBinaryExpression(node.parent) && node.parent.left === node) {
    return true;
  }

  // `foo.bar && foo.bar.parent && foo.bar.parent.value`
  // where `node` is `foo.bar`.
  if (node.parent.parent && ts.isBinaryExpression(node.parent.parent) &&
      node.parent.parent.left === node.parent) {
    return true;
  }

  // `if (foo.bar) {...}` where `node` is `foo.bar`.
  if (ts.isIfStatement(node.parent) && node.parent.expression === node) {
    return true;
  }

  // `foo.bar ? foo.bar.value : null` where `node` is `foo.bar`.
  if (ts.isConditionalExpression(node.parent) && node.parent.condition === node) {
    return true;
  }

  return false;
}

/** Checks whether a property access is safe (e.g. `foo.parent?.value`). */
export function isSafeAccess(node: ts.Node): boolean {
  return node.parent != null && ts.isPropertyAccessExpression(node.parent) &&
      node.parent.expression === node && node.parent.questionDotToken != null;
}
