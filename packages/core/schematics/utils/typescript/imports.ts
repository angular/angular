/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export type Import = {
  name: string;
  importModule: string;
  node: ts.ImportDeclaration;
};

/** Gets import information about the specified identifier by using the Type checker. */
export function getImportOfIdentifier(
  typeChecker: ts.TypeChecker,
  node: ts.Identifier,
): Import | null {
  const symbol = typeChecker.getSymbolAtLocation(node);

  if (!symbol || symbol.declarations === undefined || !symbol.declarations.length) {
    return null;
  }

  const decl = symbol.declarations[0];

  if (!ts.isImportSpecifier(decl)) {
    return null;
  }

  const importDecl = decl.parent.parent.parent;

  if (!ts.isImportDeclaration(importDecl) || !ts.isStringLiteral(importDecl.moduleSpecifier)) {
    return null;
  }

  return {
    // Handles aliased imports: e.g. "import {Component as myComp} from ...";
    name: decl.propertyName ? decl.propertyName.text : decl.name.text,
    importModule: importDecl.moduleSpecifier.text,
    node: importDecl,
  };
}

/**
 * Gets a top-level import specifier with a specific name that is imported from a particular module.
 * E.g. given a file that looks like:
 *
 * ```ts
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
  sourceFile: ts.SourceFile,
  moduleName: string | RegExp,
  specifierName: string,
): ts.ImportSpecifier | null {
  return getImportSpecifiers(sourceFile, moduleName, specifierName)[0] ?? null;
}

export function getImportSpecifiers(
  sourceFile: ts.SourceFile,
  moduleName: string | RegExp,
  specifierOrSpecifiers: string | string[],
): ts.ImportSpecifier[] {
  const matches: ts.ImportSpecifier[] = [];
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      continue;
    }

    const namedBindings = node.importClause?.namedBindings;
    const isMatch =
      typeof moduleName === 'string'
        ? node.moduleSpecifier.text === moduleName
        : moduleName.test(node.moduleSpecifier.text);

    if (!isMatch || !namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    if (typeof specifierOrSpecifiers === 'string') {
      const match = findImportSpecifier(namedBindings.elements, specifierOrSpecifiers);
      if (match) {
        matches.push(match);
      }
    } else {
      for (const specifierName of specifierOrSpecifiers) {
        const match = findImportSpecifier(namedBindings.elements, specifierName);
        if (match) {
          matches.push(match);
        }
      }
    }
  }
  return matches;
}

export function getNamedImports(
  sourceFile: ts.SourceFile,
  moduleName: string | RegExp,
): ts.NamedImports | null {
  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const isMatch =
        typeof moduleName === 'string'
          ? node.moduleSpecifier.text === moduleName
          : moduleName.test(node.moduleSpecifier.text);
      const namedBindings = node.importClause?.namedBindings;
      if (isMatch && namedBindings && ts.isNamedImports(namedBindings)) {
        return namedBindings;
      }
    }
  }
  return null;
}

/**
 * Replaces an import inside a named imports node with a different one.
 *
 * @param node Node that contains the imports.
 * @param existingImport Import that should be replaced.
 * @param newImportName Import that should be inserted.
 */
export function replaceImport(
  node: ts.NamedImports,
  existingImport: string,
  newImportName: string,
) {
  const isAlreadyImported = findImportSpecifier(node.elements, newImportName);
  if (isAlreadyImported) {
    return node;
  }

  const existingImportNode = findImportSpecifier(node.elements, existingImport);
  if (!existingImportNode) {
    return node;
  }

  const importPropertyName = existingImportNode.propertyName
    ? ts.factory.createIdentifier(newImportName)
    : undefined;
  const importName = existingImportNode.propertyName
    ? existingImportNode.name
    : ts.factory.createIdentifier(newImportName);

  return ts.factory.updateNamedImports(node, [
    ...node.elements.filter((current) => current !== existingImportNode),
    // Create a new import while trying to preserve the alias of the old one.
    ts.factory.createImportSpecifier(false, importPropertyName, importName),
  ]);
}

/**
 * Removes a symbol from the named imports and updates a node
 * that represents a given named imports.
 *
 * @param node Node that contains the imports.
 * @param symbol Symbol that should be removed.
 * @returns An updated node (ts.NamedImports).
 */
export function removeSymbolFromNamedImports(node: ts.NamedImports, symbol: ts.ImportSpecifier) {
  return ts.factory.updateNamedImports(node, [
    ...node.elements.filter((current) => current !== symbol),
  ]);
}

/** Finds an import specifier with a particular name. */
export function findImportSpecifier(
  nodes: ts.NodeArray<ts.ImportSpecifier>,
  specifierName: string,
): ts.ImportSpecifier | undefined {
  return nodes.find((element) => {
    const {name, propertyName} = element;
    return propertyName ? propertyName.text === specifierName : name.text === specifierName;
  });
}
