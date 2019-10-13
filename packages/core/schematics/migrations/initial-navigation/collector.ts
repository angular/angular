/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';


/** The property name for the options that need to be migrated */
const INITIAL_NAVIGATION = 'initialNavigation';

/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found ExtraOptions#InitialNavigation assignments.
 */
export class InitialNavigationCollector {
  public assignments: ts.PropertyAssignment[] = [];

  visitNode(node: ts.Node) {
    if (ts.isPropertyAssignment(node) &&
        (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ||
         ts.isStringLiteralLike(node.name))) {
      if (node.name.text === INITIAL_NAVIGATION && isValidInitialNavigationValue(node)) {
        this.assignments.push(node);
      }
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }
}

/**
 * Check whether the value assigned to an `initialNavigation` assignment
 * conforms to the expected types for ExtraOptions#InitialNavigation
 * @param node the property assignment to check
 */
function isValidInitialNavigationValue(node: ts.PropertyAssignment): boolean {
  return ts.isStringLiteralLike(node.initializer) ||
      node.initializer.kind === ts.SyntaxKind.FalseKeyword ||
      node.initializer.kind === ts.SyntaxKind.TrueKeyword;
}
