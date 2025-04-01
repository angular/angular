/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * A map of imported symbols to local names under which the symbols are available within a file.
 */
type LocalNamesMap = Map<string, Set<string>>;

/** Mapping between modules and the named imports consumed by them in a file. */
type NamedImportsMap = Map<string, LocalNamesMap>;

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
  private fileToNamespaceImports = new WeakMap<ts.SourceFile, LocalNamesMap>();

  /**
   * Checks if an identifier is a potential reference to a specific named import within the same
   * file.
   * @param node Identifier to be checked.
   * @param exportedName Name of the exported symbol that is being searched for.
   * @param moduleName Module from which the symbol should be imported.
   */
  isPotentialReferenceToNamedImport(
    node: ts.Identifier,
    exportedName: string,
    moduleName: string,
  ): boolean {
    const sourceFile = node.getSourceFile();
    this.scanImports(sourceFile);
    const fileImports = this.fileToNamedImports.get(sourceFile)!;
    const moduleImports = fileImports.get(moduleName);
    const symbolImports = moduleImports?.get(exportedName);
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
    return namespaces.get(moduleName)?.has(node.text) ?? false;
  }

  /**
   * Checks if a file has a named imported of a certain symbol.
   * @param sourceFile File to be checked.
   * @param exportedName Name of the exported symbol that is being checked.
   * @param moduleName Module that exports the symbol.
   */
  hasNamedImport(sourceFile: ts.SourceFile, exportedName: string, moduleName: string): boolean {
    this.scanImports(sourceFile);
    const fileImports = this.fileToNamedImports.get(sourceFile)!;
    const moduleImports = fileImports.get(moduleName);
    return moduleImports !== undefined && moduleImports.has(exportedName);
  }

  /**
   * Checks if a file has namespace imports of a certain symbol.
   * @param sourceFile File to be checked.
   * @param moduleName Module whose namespace import is being searched for.
   */
  hasNamespaceImport(sourceFile: ts.SourceFile, moduleName: string): boolean {
    this.scanImports(sourceFile);
    const namespaces = this.fileToNamespaceImports.get(sourceFile)!;
    return namespaces.has(moduleName);
  }

  /** Scans a `SourceFile` for import statements and caches them for later use. */
  private scanImports(sourceFile: ts.SourceFile): void {
    if (this.fileToNamedImports.has(sourceFile) && this.fileToNamespaceImports.has(sourceFile)) {
      return;
    }

    const namedImports: NamedImportsMap = new Map();
    const namespaceImports: LocalNamesMap = new Map();
    this.fileToNamedImports.set(sourceFile, namedImports);
    this.fileToNamespaceImports.set(sourceFile, namespaceImports);

    // Only check top-level imports.
    for (const stmt of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(stmt) ||
        !ts.isStringLiteralLike(stmt.moduleSpecifier) ||
        stmt.importClause?.namedBindings === undefined
      ) {
        continue;
      }

      const moduleName = stmt.moduleSpecifier.text;

      if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
        // import * as foo from 'module'
        if (!namespaceImports.has(moduleName)) {
          namespaceImports.set(moduleName, new Set());
        }
        namespaceImports.get(moduleName)!.add(stmt.importClause.namedBindings.name.text);
      } else {
        // import {foo, bar as alias} from 'module'
        for (const element of stmt.importClause.namedBindings.elements) {
          const localName = element.name.text;
          const exportedName =
            element.propertyName === undefined ? localName : element.propertyName.text;

          if (!namedImports.has(moduleName)) {
            namedImports.set(moduleName, new Map());
          }

          const localNames = namedImports.get(moduleName)!;

          if (!localNames.has(exportedName)) {
            localNames.set(exportedName, new Set());
          }

          localNames.get(exportedName)?.add(localName);
        }
      }
    }
  }
}
