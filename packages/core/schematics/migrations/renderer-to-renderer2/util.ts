/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Finds typed nodes (e.g. function parameters or class properties) that are referencing the old
 * `Renderer`, as well as calls to the `Renderer` methods.
 */
export function findRendererReferences(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const typedNodes = new Set<ts.ParameterDeclaration|ts.PropertyDeclaration|ts.AsExpression>();
  const methodCalls = new Set<ts.CallExpression>();

  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    if ((ts.isParameter(node) || ts.isPropertyDeclaration(node)) &&
        isRendererReference(typeChecker, node.name)) {
      typedNodes.add(node);
    } else if (ts.isAsExpression(node) && isRendererReference(typeChecker, node.type)) {
      typedNodes.add(node);
    } else if (
        ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        isRendererReference(typeChecker, node.expression.expression)) {
      methodCalls.add(node);
    }

    ts.forEachChild(node, visitNode);
  });

  return {typedNodes, methodCalls};
}

/** Finds the import of the `Renderer` in a source file. */
export function findRendererImport(sourceFile: ts.SourceFile): ts.NamedImports|null {
  // Only look through the top-level imports.
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier) ||
        node.moduleSpecifier.text !== '@angular/core') {
      continue;
    }

    const namedBindings = node.importClause && node.importClause.namedBindings;

    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    if (findImportSpecifier(namedBindings.elements, 'Renderer')) {
      return namedBindings;
    }
  }

  return null;
}

/** Finds an import specifier with a particular name, accounting for aliases. */
export function findImportSpecifier(
    elements: ts.NodeArray<ts.ImportSpecifier>, importName: string) {
  return elements.find(element => {
    const {name, propertyName} = element;
    return propertyName ? propertyName.text === importName : name.text === importName;
  });
}

/** Checks whether a node is referring to the `Renderer`. */
function isRendererReference(typeChecker: ts.TypeChecker, node: ts.Node): boolean {
  const symbol = typeChecker.getTypeAtLocation(node).getSymbol();
  return !!symbol && symbol.getName() === 'Renderer';
}
