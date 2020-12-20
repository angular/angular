/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ImportRewriter, NoopImportRewriter} from '../../imports';
import {Import, ImportGenerator, NamedImport} from './api/import_generator';

export class ImportManager implements ImportGenerator<ts.Identifier> {
  private specifierToIdentifier = new Map<string, ts.Identifier>();
  private nextIndex = 0;

  constructor(protected rewriter: ImportRewriter = new NoopImportRewriter(), private prefix = 'i') {
  }

  generateNamespaceImport(moduleName: string): ts.Identifier {
    if (!this.specifierToIdentifier.has(moduleName)) {
      this.specifierToIdentifier.set(
          moduleName, ts.createIdentifier(`${this.prefix}${this.nextIndex++}`));
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

  getAllImports(contextPath: string): Import[] {
    const imports: {specifier: string, qualifier: string}[] = [];
    this.specifierToIdentifier.forEach((qualifier, specifier) => {
      specifier = this.rewriter.rewriteSpecifier(specifier, contextPath);
      imports.push({specifier, qualifier: qualifier.text});
    });
    return imports;
  }
}
