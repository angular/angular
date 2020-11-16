/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Checks whether the given TypeScript node has the specified modifier set. */
export function hasModifier(node: ts.Node, modifierKind: ts.SyntaxKind) {
  return !!node.modifiers && node.modifiers.some(m => m.kind === modifierKind);
}

/** Find the closest parent node of a particular kind. */
export function closestNode<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T|null {
  let current: ts.Node = node;

  while (current && !ts.isSourceFile(current)) {
    if (current.kind === kind) {
      return current as T;
    }
    current = current.parent;
  }

  return null;
}
