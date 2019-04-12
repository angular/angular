/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Name of the Injectable decorator. */
export const INJECTABLE_DECORATOR_NAME = 'Injectable';

/**
 * Adds a named import to an import declaration node.
 * @param node Node to which to add the import.
 * @param importName Name of the import that should be added.
 */
export function addNamedImport(node: ts.ImportDeclaration, importName: string) {
  const namedImports = getNamedImports(node);

  if (namedImports && ts.isNamedImports(namedImports)) {
    const elements = namedImports.elements;
    const isAlreadyImported = elements.some(element => element.name.text === importName);

    if (!isAlreadyImported) {
      // If there are named imports, there will be an import clause as well.
      const importClause = node.importClause !;
      const newImportClause = ts.createNamedImports(
          [...elements, ts.createImportSpecifier(undefined, ts.createIdentifier(importName))]);

      return ts.updateImportDeclaration(
          node, node.decorators, node.modifiers,
          ts.updateImportClause(importClause, importClause.name, newImportClause),
          node.moduleSpecifier);
    }
  }

  return node;
}

/** Gets the named imports node from an import declaration. */
export function getNamedImports(node: ts.ImportDeclaration): ts.NamedImports|null {
  const importClause = node.importClause;
  const namedImports = importClause && importClause.namedBindings;
  return (namedImports && ts.isNamedImports(namedImports)) ? namedImports : null;
}
