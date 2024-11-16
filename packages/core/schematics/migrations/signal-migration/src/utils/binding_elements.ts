/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** Gets the pattern and property name for a given binding element. */
export function resolveBindingElement(node: ts.BindingElement): {
  pattern: ts.BindingPattern;
  propertyName: string;
} | null {
  const name = node.propertyName ?? node.name;

  // If we are discovering a non-analyzable element in the path, abort.
  if (!ts.isStringLiteralLike(name) && !ts.isIdentifier(name)) {
    return null;
  }

  return {
    pattern: node.parent,
    propertyName: name.text,
  };
}

/** Gets the declaration node of the given binding element. */
export function getBindingElementDeclaration(
  node: ts.BindingElement,
): ts.VariableDeclaration | ts.ParameterDeclaration {
  while (true) {
    if (ts.isBindingElement(node.parent.parent)) {
      node = node.parent.parent;
    } else {
      return node.parent.parent;
    }
  }
}
