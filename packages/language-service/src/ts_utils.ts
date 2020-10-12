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

/**
 * Return the node that most tightly encompass the specified `position`.
 * @param node
 * @param position
 */
export function findTightestNode(node: ts.Node, position: number): ts.Node|undefined {
  if (node.getStart() <= position && position < node.getEnd()) {
    return node.forEachChild(c => findTightestNode(c, position)) || node;
  }
}

/**
 * Returns a property assignment from the assignment value if the property name
 * matches the specified `key`, or `undefined` if there is no match.
 */
export function getPropertyAssignmentFromValue(value: ts.Node, key: string): ts.PropertyAssignment|
    undefined {
  const propAssignment = value.parent;
  if (!propAssignment || !ts.isPropertyAssignment(propAssignment) ||
      propAssignment.name.getText() !== key) {
    return;
  }
  return propAssignment;
}

/**
 * Given the node which is the string of the inline template for a component, returns the
 * `ts.ClassDeclaration` for the component.
 */
export function getClassDeclOfInlineTemplateNode(templateStringNode: ts.Node): ts.ClassDeclaration|
    undefined {
  if (!ts.isStringLiteralLike(templateStringNode)) {
    return;
  }
  const tmplAsgn = getPropertyAssignmentFromValue(templateStringNode, 'template');
  if (!tmplAsgn) {
    return;
  }
  return getClassDeclFromDecoratorProp(tmplAsgn);
}

/**
 * Given a decorator property assignment, return the ClassDeclaration node that corresponds to the
 * directive class the property applies to.
 * If the property assignment is not on a class decorator, no declaration is returned.
 *
 * For example,
 *
 * @Component({
 *   template: '<div></div>'
 *   ^^^^^^^^^^^^^^^^^^^^^^^---- property assignment
 * })
 * class AppComponent {}
 *           ^---- class declaration node
 *
 * @param propAsgnNode property assignment
 */
export function getClassDeclFromDecoratorProp(propAsgnNode: ts.PropertyAssignment):
    ts.ClassDeclaration|undefined {
  if (!propAsgnNode.parent || !ts.isObjectLiteralExpression(propAsgnNode.parent)) {
    return;
  }
  const objLitExprNode = propAsgnNode.parent;
  if (!objLitExprNode.parent || !ts.isCallExpression(objLitExprNode.parent)) {
    return;
  }
  const callExprNode = objLitExprNode.parent;
  if (!callExprNode.parent || !ts.isDecorator(callExprNode.parent)) {
    return;
  }
  const decorator = callExprNode.parent;
  if (!decorator.parent || !ts.isClassDeclaration(decorator.parent)) {
    return;
  }
  const classDeclNode = decorator.parent;
  return classDeclNode;
}
