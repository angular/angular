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

export interface FindOptions<T extends ts.Node> {
  filter: (node: ts.Node) => node is T;
}

/**
 * Finds TypeScript nodes descending from the provided root which match the given filter.
 */
export function findAllMatchingNodes<T extends ts.Node>(root: ts.Node, opts: FindOptions<T>): T[] {
  const matches: T[] = [];
  const explore = (currNode: ts.Node) => {
    if (opts.filter(currNode)) {
      matches.push(currNode);
    }
    currNode.forEachChild(descendent => explore(descendent));
  };
  explore(root);
  return matches;
}

/**
 * Finds TypeScript nodes descending from the provided root which match the given filter.
 */
export function findFirstMatchingNode<T extends ts.Node>(root: ts.Node, opts: FindOptions<T>): T|
    null {
  let match: T|null = null;
  const explore = (currNode: ts.Node) => {
    if (match !== null) {
      return;
    }
    if (opts.filter(currNode)) {
      match = currNode;
      return;
    }
    currNode.forEachChild(descendent => explore(descendent));
  };
  explore(root);
  return match;
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

/**
 * Create a new ArrayLiteralExpression, or accept an existing one.
 * Ensure the array contains the provided identifier.
 * Returns the array, either updated or newly created.
 * If no update is needed, returns `null`.
 */
export function ensureArrayWithIdentifier(
    identifier: ts.Identifier, arr?: ts.ArrayLiteralExpression): ts.ArrayLiteralExpression|null {
  if (arr === undefined) {
    return ts.factory.createArrayLiteralExpression([identifier]);
  }
  if (arr.elements.find(v => ts.isIdentifier(v) && v.text === identifier.text)) {
    return null;
  }
  return ts.factory.updateArrayLiteralExpression(arr, [...arr.elements, identifier]);
}

export function moduleSpecifierPointsToFile(
    tsChecker: ts.TypeChecker, moduleSpecifier: ts.Expression, file: ts.SourceFile): boolean {
  const specifierSymbol = tsChecker.getSymbolAtLocation(moduleSpecifier);
  if (specifierSymbol === undefined) {
    console.error(`Undefined symbol for module specifier ${moduleSpecifier.getText()}`);
    return false;
  }
  const symbolDeclarations = specifierSymbol.declarations;
  if (symbolDeclarations === undefined || symbolDeclarations.length === 0) {
    console.error(`Unknown symbol declarations for module specifier ${moduleSpecifier.getText()}`);
    return false;
  }
  for (const symbolDeclaration of symbolDeclarations) {
    if (symbolDeclaration.getSourceFile().fileName === file.fileName) {
      return true;
    }
  }
  return false;
}

/**
 * Determine whether this an import of the given `propertyName` from a particular module
 * specifier already exists. If so, return the local name for that import, which might be an
 * alias.
 */
export function hasImport(
    tsChecker: ts.TypeChecker, importDeclarations: ts.ImportDeclaration[], propName: string,
    origin: ts.SourceFile): string|null {
  return importDeclarations
             .filter(
                 declaration =>
                     moduleSpecifierPointsToFile(tsChecker, declaration.moduleSpecifier, origin))
             .map(declaration => importHas(declaration, propName))
             .find(prop => prop !== null) ??
      null;
}

function nameInExportScope(importSpecifier: ts.ImportSpecifier): string {
  return importSpecifier.propertyName?.text ?? importSpecifier.name.text;
}

/**
 * Determine whether this import declaration already contains an import of the given
 * `propertyName`, and if so, the name it can be referred to with in the local scope.
 */
function importHas(importDecl: ts.ImportDeclaration, propName: string): string|null {
  const bindings = importDecl.importClause?.namedBindings;
  if (bindings === undefined) {
    return null;
  }
  // First, we handle the case of explicit named imports.
  if (ts.isNamedImports(bindings)) {
    // Find any import specifier whose property name in the *export* scope equals the expected
    // name.
    const specifier =
        bindings.elements.find(importSpecifier => propName == nameInExportScope(importSpecifier));
    // Return the name of the property in the *local* scope.
    if (specifier === undefined) {
      return null;
    }
    return specifier.name.text;
  }
  // The other case is a namespace import.
  return `${bindings.name.text}.${propName}`;
}

/**
 * Given an unqualified name, determine whether an existing import is already using this name in
 * the current scope.
 * TODO: It would be better to check if *any* symbol uses this name in the current scope.
 */
function importCollisionExists(importDeclaration: ts.ImportDeclaration[], name: string): boolean {
  const bindings = importDeclaration.map(declaration => declaration.importClause?.namedBindings);
  const namedBindings: ts.NamedImports[] =
      bindings.filter(binding => binding !== undefined && ts.isNamedImports(binding)) as
      ts.NamedImports[];
  const specifiers = namedBindings.flatMap(b => b.elements);
  return specifiers.some(s => s.name.text === name);
}

/**
 * Generator function that yields an infinite sequence of alternative aliases for a given symbol
 * name.
 */
function* suggestAlternativeSymbolNames(name: string): Iterator<string> {
  for (let i = 1; true; i++) {
    yield `${name}_${i}`;  // The _n suffix is the same style as TS generated aliases
  }
}

/**
 * Transform the given import name into an alias that does not collide with any other import
 * symbol.
 */
export function nonCollidingImportName(
    importDeclarations: ts.ImportDeclaration[], name: string): string {
  const possibleNames = suggestAlternativeSymbolNames(name);
  while (importCollisionExists(importDeclarations, name)) {
    name = possibleNames.next().value;
  }
  return name;
}

/**
 * Generate a new import. Follows the format:
 * ```
 * import {exportedSpecifierName as localName} from 'rawModuleSpecifier';
 * ```
 *
 * If `exportedSpecifierName` is null, or is equal to `name`, then the qualified import alias will
 * be omitted.
 */
export function generateImport(
    localName: string, exportedSpecifierName: string|null,
    rawModuleSpecifier: string): ts.ImportDeclaration {
  let propName: ts.Identifier|undefined;
  if (exportedSpecifierName !== null && exportedSpecifierName !== localName) {
    propName = ts.factory.createIdentifier(exportedSpecifierName);
  }
  const name = ts.factory.createIdentifier(localName);
  const moduleSpec = ts.factory.createStringLiteral(rawModuleSpecifier);
  return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
          false, undefined,
          ts.factory.createNamedImports([ts.factory.createImportSpecifier(false, propName, name)])),
      moduleSpec, undefined);
}

/**
 * Update an existing named import with a new member.
 * If `exportedSpecifierName` is null, or is equal to `name`, then the qualified import alias will
 * be omitted.
 */
export function updateImport(
    imp: ts.NamedImports, localName: string, exportedSpecifierName: string|null): ts.NamedImports {
  let propertyName: ts.Identifier|undefined;
  if (exportedSpecifierName !== null && exportedSpecifierName !== localName) {
    propertyName = ts.factory.createIdentifier(exportedSpecifierName);
  }
  const name = ts.factory.createIdentifier(localName);
  const newImport = ts.factory.createImportSpecifier(false, propertyName, name);
  return ts.factory.updateNamedImports(imp, [...imp.elements, newImport]);
}

let printer: ts.Printer|null = null;

/**
 * Get a ts.Printer for printing AST nodes, reusing the previous Printer if already created.
 */
function getOrCreatePrinter(): ts.Printer {
  if (printer === null) {
    printer = ts.createPrinter();
  }
  return printer;
}

/**
 * Print a given TypeScript node into a string. Used to serialize entirely synthetic generated AST,
 * which will not have `.text` or `.fullText` set.
 */
export function printNode(node: ts.Node, sourceFile: ts.SourceFile): string {
  return getOrCreatePrinter().printNode(ts.EmitHint.Unspecified, node, sourceFile);
}
