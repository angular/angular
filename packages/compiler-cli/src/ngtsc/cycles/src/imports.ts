/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';

/**
 * A cached graph of imports in the `ts.Program`.
 *
 * The `ImportGraph` keeps track of dependencies (imports) of individual `ts.SourceFile`s. Only
 * dependencies within the same program are tracked; imports into packages on NPM are not.
 */
export class ImportGraph {
  private map = new Map<ts.SourceFile, Set<ts.SourceFile>>();

  constructor(private resolver: ModuleResolver) {}

  /**
   * List the direct (not transitive) imports of a given `ts.SourceFile`.
   *
   * This operation is cached.
   */
  importsOf(sf: ts.SourceFile): Set<ts.SourceFile> {
    if (!this.map.has(sf)) {
      this.map.set(sf, this.scanImports(sf));
    }
    return this.map.get(sf) !;
  }

  /**
   * Lists the transitive imports of a given `ts.SourceFile`.
   */
  transitiveImportsOf(sf: ts.SourceFile): Set<ts.SourceFile> {
    const imports = new Set<ts.SourceFile>();
    this.transitiveImportsOfHelper(sf, imports);
    return imports;
  }

  private transitiveImportsOfHelper(sf: ts.SourceFile, results: Set<ts.SourceFile>): void {
    if (results.has(sf)) {
      return;
    }
    results.add(sf);
    this.importsOf(sf).forEach(imported => { this.transitiveImportsOfHelper(imported, results); });
  }

  /**
   * Add a record of an import from `sf` to `imported`, that's not present in the original
   * `ts.Program` but will be remembered by the `ImportGraph`.
   */
  addSyntheticImport(sf: ts.SourceFile, imported: ts.SourceFile): void {
    if (isLocalFile(imported)) {
      this.importsOf(sf).add(imported);
    }
  }

  private scanImports(sf: ts.SourceFile): Set<ts.SourceFile> {
    const imports = new Set<ts.SourceFile>();
    // Look through the source file for import statements.
    sf.statements.forEach(stmt => {
      if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
          stmt.moduleSpecifier !== undefined && ts.isStringLiteral(stmt.moduleSpecifier)) {
        // Resolve the module to a file, and check whether that file is in the ts.Program.
        const moduleName = stmt.moduleSpecifier.text;
        const moduleFile = this.resolver.resolveModuleName(moduleName, sf);
        if (moduleFile !== null && isLocalFile(moduleFile)) {
          // Record this local import.
          imports.add(moduleFile);
        }
      }
    });
    return imports;
  }
}

function isLocalFile(sf: ts.SourceFile): boolean {
  return !sf.fileName.endsWith('.d.ts');
}
