/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {relativePathBetween} from '../../util/src/path';

/**
 * Rewrites imports of symbols being written into generated code.
 */
export interface ImportRewriter {
  /**
   * Optionally rewrite a reference to an imported symbol, changing either the binding prefix or the
   * symbol name itself.
   */
  rewriteSymbol(symbol: string, specifier: string): string;

  /**
   * Optionally rewrite the given module specifier in the context of a given file.
   */
  rewriteSpecifier(specifier: string, inContextOfFile: string): string;

  /**
   * Optionally rewrite the identifier of a namespace import.
   */
  rewriteNamespaceImportIdentifier(specifier: string, moduleName: string): string;
}

/**
 * `ImportRewriter` that does no rewriting.
 */
export class NoopImportRewriter implements ImportRewriter {
  rewriteSymbol(symbol: string, specifier: string): string {
    return symbol;
  }

  rewriteSpecifier(specifier: string, inContextOfFile: string): string {
    return specifier;
  }

  rewriteNamespaceImportIdentifier(specifier: string): string {
    return specifier;
  }
}

/**
 * A mapping of supported symbols that can be imported from within @angular/core, and the names by
 * which they're exported from r3_symbols.
 */
const CORE_SUPPORTED_SYMBOLS = new Map<string, string>([
  ['ɵɵdefineInjectable', 'ɵɵdefineInjectable'],
  ['ɵɵdefineInjector', 'ɵɵdefineInjector'],
  ['ɵɵdefineNgModule', 'ɵɵdefineNgModule'],
  ['ɵɵsetNgModuleScope', 'ɵɵsetNgModuleScope'],
  ['ɵɵinject', 'ɵɵinject'],
  ['ɵɵFactoryDeclaration', 'ɵɵFactoryDeclaration'],
  ['ɵsetClassMetadata', 'setClassMetadata'],
  ['ɵsetClassMetadataAsync', 'setClassMetadataAsync'],
  ['ɵɵInjectableDeclaration', 'ɵɵInjectableDeclaration'],
  ['ɵɵInjectorDeclaration', 'ɵɵInjectorDeclaration'],
  ['ɵɵNgModuleDeclaration', 'ɵɵNgModuleDeclaration'],
  ['ɵNgModuleFactory', 'NgModuleFactory'],
  ['ɵnoSideEffects', 'ɵnoSideEffects'],
]);

const CORE_MODULE = '@angular/core';

/**
 * `ImportRewriter` that rewrites imports from '@angular/core' to be imported from the r3_symbols.ts
 * file instead.
 */
export class R3SymbolsImportRewriter implements ImportRewriter {
  constructor(private r3SymbolsPath: string) {}

  rewriteSymbol(symbol: string, specifier: string): string {
    if (specifier !== CORE_MODULE) {
      // This import isn't from core, so ignore it.
      return symbol;
    }

    return validateAndRewriteCoreSymbol(symbol);
  }

  rewriteSpecifier(specifier: string, inContextOfFile: string): string {
    if (specifier !== CORE_MODULE) {
      // This module isn't core, so ignore it.
      return specifier;
    }

    const relativePathToR3Symbols = relativePathBetween(inContextOfFile, this.r3SymbolsPath);
    if (relativePathToR3Symbols === null) {
      throw new Error(
        `Failed to rewrite import inside ${CORE_MODULE}: ${inContextOfFile} -> ${this.r3SymbolsPath}`,
      );
    }

    return relativePathToR3Symbols;
  }

  rewriteNamespaceImportIdentifier(specifier: string): string {
    return specifier;
  }
}

export function validateAndRewriteCoreSymbol(name: string): string {
  if (!CORE_SUPPORTED_SYMBOLS.has(name)) {
    throw new Error(`Importing unexpected symbol ${name} while compiling ${CORE_MODULE}`);
  }
  return CORE_SUPPORTED_SYMBOLS.get(name)!;
}
