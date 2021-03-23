/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export type Import = {
  name: string,
  importModule: string,
  node: ts.ImportDeclaration
};

/** Gets import information about the specified identifier by using the Type checker. */
export function getImportOfIdentifier(typeChecker: ts.TypeChecker, node: ts.Identifier): Import|
    null {
  const symbol = typeChecker.getSymbolAtLocation(node);

  if (!symbol || !symbol.declarations.length) {
    return null;
  }

  const decl = symbol.declarations[0];

  if (!ts.isImportSpecifier(decl)) {
    return null;
  }

  const importDecl = decl.parent.parent.parent;

  if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
    return null;
  }

  return {
    // Handles aliased imports: e.g. "import {Component as myComp} from ...";
    name: decl.propertyName ? decl.propertyName.text : decl.name.text,
    importModule: importDecl.moduleSpecifier.text,
    node: importDecl
  };
}


/**
 * Gets a top-level import specifier with a specific name that is imported from a particular module.
 * E.g. given a file that looks like:
 *
 * ```
 * import { Component, Directive } from '@angular/core';
 * import { Foo } from './foo';
 * ```
 *
 * Calling `getImportSpecifier(sourceFile, '@angular/core', 'Directive')` will yield the node
 * referring to `Directive` in the top import.
 *
 * @param sourceFile File in which to look for imports.
 * @param moduleName Name of the import's module.
 * @param specifierName Original name of the specifier to look for. Aliases will be resolved to
 *    their original name.
 */
export function getImportSpecifier(
    sourceFile: ts.SourceFile, moduleName: string, specifierName: string): ts.ImportSpecifier|null {
  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === moduleName) {
      const namedBindings = node.importClause && node.importClause.namedBindings;
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        const match = findImportSpecifier(namedBindings.elements, specifierName);
        if (match) {
          return match;
        }
      }
    }
  }

  return null;
}


/**
 * Replaces an import inside a named imports node with a different one.
 * @param node Node that contains the imports.
 * @param existingImport Import that should be replaced.
 * @param newImportName Import that should be inserted.
 */
export function replaceImport(
    node: ts.NamedImports, existingImport: string, newImportName: string) {
  const isAlreadyImported = findImportSpecifier(node.elements, newImportName);
  if (isAlreadyImported) {
    return node;
  }

  const existingImportNode = findImportSpecifier(node.elements, existingImport);
  if (!existingImportNode) {
    return node;
  }

  return ts.updateNamedImports(node, [
    ...node.elements.filter(current => current !== existingImportNode),
    // Create a new import while trying to preserve the alias of the old one.
    ts.createImportSpecifier(
        existingImportNode.propertyName ? ts.createIdentifier(newImportName) : undefined,
        existingImportNode.propertyName ? existingImportNode.name :
                                          ts.createIdentifier(newImportName))
  ]);
}


/** Finds an import specifier with a particular name. */
export function findImportSpecifier(
    nodes: ts.NodeArray<ts.ImportSpecifier>, specifierName: string): ts.ImportSpecifier|undefined {
  return nodes.find(element => {
    const {name, propertyName} = element;
    return propertyName ? propertyName.text === specifierName : name.text === specifierName;
  });
}
