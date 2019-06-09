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
export function findRendererReferences(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, rendererImport: ts.NamedImports) {
  const typedNodes = new Set<ts.ParameterDeclaration|ts.PropertyDeclaration|ts.AsExpression>();
  const methodCalls = new Set<ts.CallExpression>();
  const forwardRefs = new Set<ts.Identifier>();
  const importSpecifier = findImportSpecifier(rendererImport.elements, 'Renderer');
  const forwardRefImport = findCoreImport(sourceFile, 'forwardRef');
  const forwardRefSpecifier =
      forwardRefImport ? findImportSpecifier(forwardRefImport.elements, 'forwardRef') : null;

  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    if ((ts.isParameter(node) || ts.isPropertyDeclaration(node)) &&
        isReferenceToImport(typeChecker, node.name, importSpecifier)) {
      typedNodes.add(node);
    } else if (
        ts.isAsExpression(node) && isReferenceToImport(typeChecker, node.type, importSpecifier)) {
      typedNodes.add(node);
    } else if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) &&
          isReferenceToImport(typeChecker, node.expression.expression, importSpecifier)) {
        methodCalls.add(node);
      } else if (
          // If we're dealing with a forwardRef that's returning a Renderer.
          forwardRefSpecifier && ts.isIdentifier(node.expression) &&
          isReferenceToImport(typeChecker, node.expression, forwardRefSpecifier) &&
          node.arguments.length) {
        const rendererIdentifier =
            findRendererIdentifierInForwardRef(typeChecker, node, importSpecifier);
        if (rendererIdentifier) {
          forwardRefs.add(rendererIdentifier);
        }
      }
    }

    ts.forEachChild(node, visitNode);
  });

  return {typedNodes, methodCalls, forwardRefs};
}

/** Finds the import from @angular/core that has a symbol with a particular name. */
export function findCoreImport(sourceFile: ts.SourceFile, symbolName: string): ts.NamedImports|
    null {
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

    if (findImportSpecifier(namedBindings.elements, symbolName)) {
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
  }) ||
      null;
}

/** Checks whether a node is referring to an import spcifier. */
function isReferenceToImport(
    typeChecker: ts.TypeChecker, node: ts.Node,
    importSpecifier: ts.ImportSpecifier | null): boolean {
  if (importSpecifier) {
    const nodeSymbol = typeChecker.getTypeAtLocation(node).getSymbol();
    const importSymbol = typeChecker.getTypeAtLocation(importSpecifier).getSymbol();
    return !!(nodeSymbol && importSymbol) &&
        nodeSymbol.valueDeclaration === importSymbol.valueDeclaration;
  }
  return false;
}

/** Finds the identifier referring to the `Renderer` inside a `forwardRef` call expression. */
function findRendererIdentifierInForwardRef(
    typeChecker: ts.TypeChecker, node: ts.CallExpression,
    rendererImport: ts.ImportSpecifier | null): ts.Identifier|null {
  const firstArg = node.arguments[0];

  if (ts.isArrowFunction(firstArg)) {
    // Check if the function is `forwardRef(() => Renderer)`.
    if (ts.isIdentifier(firstArg.body) &&
        isReferenceToImport(typeChecker, firstArg.body, rendererImport)) {
      return firstArg.body;
    } else if (ts.isBlock(firstArg.body) && ts.isReturnStatement(firstArg.body.statements[0])) {
      // Otherwise check if the expression is `forwardRef(() => { return Renderer })`.
      const returnStatement = firstArg.body.statements[0] as ts.ReturnStatement;

      if (returnStatement.expression && ts.isIdentifier(returnStatement.expression) &&
          isReferenceToImport(typeChecker, returnStatement.expression, rendererImport)) {
        return returnStatement.expression;
      }
    }
  }

  return null;
}
