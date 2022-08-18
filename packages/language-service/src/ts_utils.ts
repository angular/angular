/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

/**
 * Return the node that most tightly encompasses the specified `position`.
 * @param node The starting node to start the top-down search.
 * @param position The target position within the `node`.
 */
export function findTightestNode(node: ts.Node, position: number): ts.Node|undefined {
  if (node.getStart() <= position && position < node.getEnd()) {
    return node.forEachChild(c => findTightestNode(c, position)) ?? node;
  }
  return undefined;
}

export function getParentClassDeclaration(startNode: ts.Node): ts.ClassDeclaration|undefined {
  while (startNode) {
    if (ts.isClassDeclaration(startNode)) {
      return startNode;
    }
    startNode = startNode.parent;
  }
  return undefined;
}

/**
 * Returns a property assignment from the assignment value if the property name
 * matches the specified `key`, or `null` if there is no match.
 */
export function getPropertyAssignmentFromValue(value: ts.Node, key: string): ts.PropertyAssignment|
    null {
  const propAssignment = value.parent;
  if (!propAssignment || !ts.isPropertyAssignment(propAssignment) ||
      propAssignment.name.getText() !== key) {
    return null;
  }
  return propAssignment;
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

/**
 * Collects all member methods, including those from base classes.
 */
export function collectMemberMethods(
    clazz: ts.ClassDeclaration, typeChecker: ts.TypeChecker): ts.MethodDeclaration[] {
  const members: ts.MethodDeclaration[] = [];
  const apparentProps = typeChecker.getTypeAtLocation(clazz).getApparentProperties();
  for (const prop of apparentProps) {
    if (prop.valueDeclaration && ts.isMethodDeclaration(prop.valueDeclaration)) {
      members.push(prop.valueDeclaration);
    }
  }
  return members;
}

/**
 * Given an existing array literal expression, update it by pushing a new expression.
 */
export function addElementToArrayLiteral(
    arr: ts.ArrayLiteralExpression, elem: ts.Expression): ts.ArrayLiteralExpression {
  return ts.factory.updateArrayLiteralExpression(arr, [...arr.elements, elem]);
}

/**
 * Given an ObjectLiteralExpression node, extract and return the PropertyAssignment corresponding to
 * the given key. `null` if no such key exists.
 */
export function objectPropertyAssignmentForKey(
    obj: ts.ObjectLiteralExpression, key: string): ts.PropertyAssignment|null {
  const matchingProperty = obj.properties.filter(
      a => a.name !== undefined && ts.isIdentifier(a.name) && a.name.escapedText === key)[0];
  return matchingProperty && ts.isPropertyAssignment(matchingProperty) ? matchingProperty : null;
}

/**
 * Given an ObjectLiteralExpression node, create or update the specified key, using the provided
 * callback to generate the new value (possibly based on an old value).
 */
export function updateObjectValueForKey(
    obj: ts.ObjectLiteralExpression, key: string,
    newValueFn: (oldValue?: ts.Expression) => ts.Expression): ts.ObjectLiteralExpression {
  const existingProp = objectPropertyAssignmentForKey(obj, key);
  const newProp = ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(key), newValueFn(existingProp?.initializer));
  return ts.factory.updateObjectLiteralExpression(obj, [
    ...obj.properties.filter(p => p !== existingProp),
    newProp,
  ]);
}
