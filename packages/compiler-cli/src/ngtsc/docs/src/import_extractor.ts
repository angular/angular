/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * For a given SourceFile, it extracts all imported symbols from other Angular packages.
 *
 * @returns a map Symbol => Package, eg: ApplicationRef => @angular/core
 */
export function getImportedSymbols(sourceFile: ts.SourceFile): Map<string, string> {
  const importSpecifiers = new Map<string, string>();

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      let moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');

      if (moduleSpecifier.startsWith('@angular/')) {
        const namedBindings = node.importClause?.namedBindings;

        if (namedBindings && ts.isNamedImports(namedBindings)) {
          namedBindings.elements.forEach((importSpecifier) => {
            const importName = importSpecifier.name.text;
            const importAlias = importSpecifier.propertyName
              ? importSpecifier.propertyName.text
              : undefined;

            importSpecifiers.set(importAlias ?? importName, moduleSpecifier);
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return importSpecifiers;
}
