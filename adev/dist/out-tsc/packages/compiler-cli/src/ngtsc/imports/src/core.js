/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {relativePathBetween} from '../../util/src/path';
/**
 * `ImportRewriter` that does no rewriting.
 */
export class NoopImportRewriter {
  rewriteSymbol(symbol, specifier) {
    return symbol;
  }
  rewriteSpecifier(specifier, inContextOfFile) {
    return specifier;
  }
  rewriteNamespaceImportIdentifier(specifier) {
    return specifier;
  }
}
/**
 * A mapping of supported symbols that can be imported from within @angular/core, and the names by
 * which they're exported from r3_symbols.
 */
const CORE_SUPPORTED_SYMBOLS = new Map([
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
export class R3SymbolsImportRewriter {
  r3SymbolsPath;
  constructor(r3SymbolsPath) {
    this.r3SymbolsPath = r3SymbolsPath;
  }
  rewriteSymbol(symbol, specifier) {
    if (specifier !== CORE_MODULE) {
      // This import isn't from core, so ignore it.
      return symbol;
    }
    return validateAndRewriteCoreSymbol(symbol);
  }
  rewriteSpecifier(specifier, inContextOfFile) {
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
  rewriteNamespaceImportIdentifier(specifier) {
    return specifier;
  }
}
export function validateAndRewriteCoreSymbol(name) {
  if (!CORE_SUPPORTED_SYMBOLS.has(name)) {
    throw new Error(`Importing unexpected symbol ${name} while compiling ${CORE_MODULE}`);
  }
  return CORE_SUPPORTED_SYMBOLS.get(name);
}
//# sourceMappingURL=core.js.map
