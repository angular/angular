/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Mapping between modules and the named imports consumed by them in a file. */
type NamedImportsMap = {
  [moduleName: string]: {
    // The key is the symbol's original name, while the set
    // includes all the local names it is vailable under.
    [exportedName: string]: Set<string>,
  }
};

type NamespaceImportsMap = {
  // The key is a set of names the namespace is available under within a file.
  [moduleName: string]: Set<string>
};

/**
 * Tracks which symbols are imported in specific files and under what names. Allows for efficient
 * querying for references to those symbols without having to consult the type checker early in the
 * process.
 *
 * Note that the tracker doesn't account for variable shadowing so a final verification with the
 * type checker may be necessary, depending on the context. Also does not track dynamic imports.
 */
export class ImportedSymbolsTracker {
  private fileToNamedImports = new WeakMap<ts.SourceFile, NamedImportsMap>();
  private fileToNamespaceImports = new WeakMap<ts.SourceFile, NamespaceImportsMap>();

  /**
   * Checks if an identifier is a potential reference to a specific named import within the same
   * file.
   * @param node Identifier to be checked.
   * @param exportedName Name of the exported symbol that is being searched for.
   * @param moduleName Module from which the symbol should be imported.
   */
  isPotentialReferenceToNamedImport(node: ts.Identifier, exportedName: string, moduleName: string):
      boolean {
    const sourceFile = node.getSourceFile();
    this.scanImports(sourceFile);
    const fileImports = this.fileToNamedImports.get(sourceFile)!;
    const moduleImports = fileImports[moduleName] ?? null;
    const symbolImports = moduleImports?.[exportedName];
    return symbolImports !== undefined && symbolImports.has(node.text);
  }

  /**
   * Checks if an identifier is a potential reference to a specific namespace import within the same
   * file.
   * @param node Identifier to be checked.
   * @param moduleName Module from which the namespace is imported.
   */
  isPotentialReferenceToNamespaceImport(node: ts.Identifier, moduleName: string): boolean {
    const sourceFile = node.getSourceFile();
    this.scanImports(sourceFile);
    const namespaces = this.fileToNamespaceImports.get(sourceFile)!;
    return namespaces[moduleName]?.has(node.text) ?? false;
  }

  /** Scans a `SourceFile` for import statements and caches them for later use. */
  private scanImports(sourceFile: ts.SourceFile): void {
    if (this.fileToNamedImports.has(sourceFile) && this.fileToNamespaceImports.has(sourceFile)) {
      return;
    }

    const namedImports: NamedImportsMap = {};
    const namespaceImports: NamespaceImportsMap = {};
    this.fileToNamedImports.set(sourceFile, namedImports);
    this.fileToNamespaceImports.set(sourceFile, namespaceImports);

    // Only check top-level imports.
    for (const stmt of sourceFile.statements) {
      if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteralLike(stmt.moduleSpecifier) ||
          stmt.importClause?.namedBindings === undefined) {
        continue;
      }

      const moduleName = stmt.moduleSpecifier.text;

      if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
        // import * as foo from 'module'
        namespaceImports[moduleName] ??= new Set();
        namespaceImports[moduleName].add(stmt.importClause.namedBindings.name.text);
      } else {
        // import {foo, bar as alias} from 'module'
        for (const element of stmt.importClause.namedBindings.elements) {
          const localName = element.name.text;
          const exportedName =
              element.propertyName === undefined ? localName : element.propertyName.text;
          namedImports[moduleName] ??= {};
          namedImports[moduleName][exportedName] ??= new Set();
          namedImports[moduleName][exportedName].add(localName);
        }
      }
    }
  }
}
