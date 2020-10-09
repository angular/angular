/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

interface DirectiveClassLike {
  decoratorId: ts.Identifier;  // decorator identifier, like @Component
  classId: ts.Identifier;
}

/**
 * Return metadata about `node` if it looks like an Angular directive class.
 * In this case, potential matches are `@NgModule`, `@Component`, `@Directive`,
 * `@Pipe`, etc.
 * These class declarations all share some common attributes, namely their
 * decorator takes exactly one parameter and the parameter must be an object
 * literal.
 *
 * For example,
 *     v---------- `decoratorId`
 * @NgModule({           <
 *   declarations: [],   < classDecln-al
 * })                    <
 * class AppModule {}    <
 *          ^----- `classId`
 *
 * @param node Potential node that represents an Angular directive.
 */
export function getDirectiveClassLike(node: ts.Node): DirectiveClassLike|undefined {
  if (!ts.isClassDeclaration(node) || !node.name || !node.decorators) {
    return;
  }
  for (const d of node.decorators) {
    const expr = d.expression;
    if (!ts.isCallExpression(expr) || expr.arguments.length !== 1 ||
        !ts.isIdentifier(expr.expression)) {
      continue;
    }
    const arg = expr.arguments[0];
    if (ts.isObjectLiteralExpression(arg)) {
      return {
        decoratorId: expr.expression,
        classId: node.name,
      };
    }
  }
}

/**
 * Finds the value of a property assignment that is nested in a TypeScript node and is of a certain
 * type T.
 *
 * @param startNode node to start searching for nested property assignment from
 * @param propName property assignment name
 * @param predicate function to verify that a node is of type T.
 * @return node property assignment value of type T, or undefined if none is found
 */
export function findPropertyValueOfType<T extends ts.Node>(
    startNode: ts.Node, propName: string, predicate: (node: ts.Node) => node is T): T|undefined {
  if (ts.isPropertyAssignment(startNode) && startNode.name.getText() === propName) {
    const {initializer} = startNode;
    if (predicate(initializer)) return initializer;
  }
  return startNode.forEachChild(c => findPropertyValueOfType(c, propName, predicate));
}
