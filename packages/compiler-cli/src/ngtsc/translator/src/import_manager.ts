/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {ImportRewriter, NoopImportRewriter} from '../../imports';

import {ImportGenerator, NamedImport} from './api/import_generator';

/**
 * Information about a namespace import that has been added to a module.
 */
export interface NamespaceImport {
  /** The name of the module that has been imported. */
  specifier: string;

  /** The `ts.Identifier` by which the imported module is known. */
  qualifier: ts.Identifier;
}

/**
 * Information about a side effect import that has been added to a module.
 */
export interface SideEffectImport {
  /** The name of the module that has been imported. */
  specifier: string;

  /**
   * The qualifier of a side effect import is always non-existent, and that can be used to check
   * whether the import is side effect or not.
   */
  qualifier: null;
}

/**
 * Information about an import that has been added to a module.
 */
export type Import = NamespaceImport|SideEffectImport;

export class ImportManager implements ImportGenerator<ts.Identifier> {
  private specifierToIdentifier = new Map<string, ts.Identifier|null>();
  private nextIndex = 0;

  constructor(
      protected rewriter: ImportRewriter = new NoopImportRewriter(), private prefix = 'i',
      private factory = ts.factory) {}

  generateNamespaceImport(moduleName: string): ts.Identifier {
    // The case `specifierToIdentifier.get(moduleName) === null` is also considered to overwrite the
    // side effect import since namedspace import is enough.
    if (!this.specifierToIdentifier.has(moduleName) ||
        this.specifierToIdentifier.get(moduleName) === null) {
      this.specifierToIdentifier.set(
          moduleName, this.factory.createIdentifier(`${this.prefix}${this.nextIndex++}`));
    }
    return this.specifierToIdentifier.get(moduleName)!;
  }

  generateNamedImport(moduleName: string, originalSymbol: string): NamedImport<ts.Identifier> {
    // First, rewrite the symbol name.
    const symbol = this.rewriter.rewriteSymbol(originalSymbol, moduleName);

    // Ask the rewriter if this symbol should be imported at all. If not, it can be referenced
    // directly (moduleImport: null).
    if (!this.rewriter.shouldImportSymbol(symbol, moduleName)) {
      // The symbol should be referenced directly.
      return {moduleImport: null, symbol};
    }

    // If not, this symbol will be imported using a generated namespace import.
    const moduleImport = this.generateNamespaceImport(moduleName);

    return {moduleImport, symbol};
  }

  generateSideEffectImport(moduleName: string) {
    if (!this.specifierToIdentifier.has(moduleName)) {
      this.specifierToIdentifier.set(moduleName, null);
    }
  }

  getAllImports(contextPath: string): Import[] {
    const imports: Import[] = [];
    for (const [originalSpecifier, qualifier] of this.specifierToIdentifier) {
      const specifier = this.rewriter.rewriteSpecifier(originalSpecifier, contextPath);
      imports.push({
        specifier,
        qualifier,
      });
    }
    return imports;
  }
}
