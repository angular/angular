/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ImportRewriter, NoopImportRewriter} from '../../imports/src/core';

/**
 * Information about an import that has been added to a module.
 */
export interface Import {
  /** The name of the module that has been imported. */
  specifier: string;
  /** The alias of the imported module. */
  qualifier: string;
}

/**
 * The symbol name and import namespace of an imported symbol,
 * which has been registered through the ImportManager.
 */
export interface NamedImport {
  /** The import namespace containing this imported symbol. */
  moduleImport: string|null;
  /** The (possibly rewritten) name of the imported symbol. */
  symbol: string;
}

export class ImportManager {
  private specifierToIdentifier = new Map<string, string>();
  private nextIndex = 0;

  constructor(protected rewriter: ImportRewriter = new NoopImportRewriter(), private prefix = 'i') {
  }

  generateNamedImport(moduleName: string, originalSymbol: string): NamedImport {
    // First, rewrite the symbol name.
    const symbol = this.rewriter.rewriteSymbol(originalSymbol, moduleName);

    // Ask the rewriter if this symbol should be imported at all. If not, it can be referenced
    // directly (moduleImport: null).
    if (!this.rewriter.shouldImportSymbol(symbol, moduleName)) {
      // The symbol should be referenced directly.
      return {moduleImport: null, symbol};
    }

    // If not, this symbol will be imported. Allocate a prefix for the imported module if needed.

    if (!this.specifierToIdentifier.has(moduleName)) {
      this.specifierToIdentifier.set(moduleName, `${this.prefix}${this.nextIndex++}`);
    }
    const moduleImport = this.specifierToIdentifier.get(moduleName)!;

    return {moduleImport, symbol};
  }

  getAllImports(contextPath: string): Import[] {
    const imports: {specifier: string, qualifier: string}[] = [];
    this.specifierToIdentifier.forEach((qualifier, specifier) => {
      specifier = this.rewriter.rewriteSpecifier(specifier, contextPath);
      imports.push({specifier, qualifier});
    });
    return imports;
  }
}
