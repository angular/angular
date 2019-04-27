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
 * Adds an import to a named import node, if the import does not exist already.
 * @param node Node to which to add the import.
 * @param importName Name of the import that should be added.
 */
export function addImport(node: ts.NamedImports, importName: string) {
  const elements = node.elements;
  const isAlreadyImported = elements.some(element => element.name.text === importName);

  if (!isAlreadyImported) {
    return ts.updateNamedImports(
        node, [...elements, ts.createImportSpecifier(undefined, ts.createIdentifier(importName))]);
  }

  return node;
}

/** Gets the named imports node from an import declaration. */
export function getNamedImports(node: ts.ImportDeclaration): ts.NamedImports|null {
  const importClause = node.importClause;
  const namedImports = importClause && importClause.namedBindings;
  return (namedImports && ts.isNamedImports(namedImports)) ? namedImports : null;
}
