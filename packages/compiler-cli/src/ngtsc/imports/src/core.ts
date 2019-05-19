/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANGULAR_CORE_SPECIFIER, AbsoluteFsPath, ModuleSpecifier} from '../../path';
import {relativePathBetween} from '../../util/src/path';

/**
 * Rewrites imports of symbols being written into generated code.
 */
export interface ImportRewriter {
  /**
   * Should the given symbol be imported at all?
   *
   * If `true`, the symbol should be imported from the given specifier. If `false`, the symbol
   * should be referenced directly, without an import.
   */
  shouldImportSymbol(symbol: string, specifier: ModuleSpecifier): boolean;

  /**
   * Optionally rewrite a reference to an imported symbol, changing either the binding prefix or the
   * symbol name itself.
   */
  rewriteSymbol(symbol: string, specifier: ModuleSpecifier): string;

  /**
   * Optionally rewrite the given module specifier in the context of a given file.
   */
  rewriteSpecifier(specifier: ModuleSpecifier, inContextOfFile: AbsoluteFsPath): ModuleSpecifier;
}

/**
 * `ImportRewriter` that does no rewriting.
 */
export class NoopImportRewriter implements ImportRewriter {
  shouldImportSymbol(symbol: string, specifier: ModuleSpecifier): boolean { return true; }

  rewriteSymbol(symbol: string, specifier: ModuleSpecifier): string { return symbol; }

  rewriteSpecifier(specifier: ModuleSpecifier, inContextOfFile: AbsoluteFsPath): ModuleSpecifier {
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
  ['ɵsetClassMetadata', 'setClassMetadata'],
  ['ɵɵInjectableDef', 'ɵɵInjectableDef'],
  ['ɵɵInjectorDef', 'ɵɵInjectorDef'],
  ['ɵɵNgModuleDefWithMeta', 'ɵɵNgModuleDefWithMeta'],
  ['ɵNgModuleFactory', 'NgModuleFactory'],
]);

/**
 * `ImportRewriter` that rewrites imports from '@angular/core' to be imported from the r3_symbols.ts
 * file instead.
 */
export class R3SymbolsImportRewriter implements ImportRewriter {
  constructor(private r3SymbolsPath: AbsoluteFsPath) {}

  shouldImportSymbol(symbol: string, specifier: ModuleSpecifier): boolean { return true; }

  rewriteSymbol(symbol: string, specifier: ModuleSpecifier): string {
    if (specifier !== ANGULAR_CORE_SPECIFIER) {
      // This import isn't from core, so ignore it.
      return symbol;
    }

    return validateAndRewriteCoreSymbol(symbol);
  }

  rewriteSpecifier(specifier: ModuleSpecifier, inContextOfFile: AbsoluteFsPath): ModuleSpecifier {
    if (specifier !== ANGULAR_CORE_SPECIFIER) {
      // This module isn't core, so ignore it.
      return specifier;
    }

    const relativePathToR3Symbols = relativePathBetween(inContextOfFile, this.r3SymbolsPath);
    if (relativePathToR3Symbols === null) {
      throw new Error(
          `Failed to rewrite import inside ${ANGULAR_CORE_SPECIFIER}: ${inContextOfFile} -> ${this.r3SymbolsPath}`);
    }

    return relativePathToR3Symbols;
  }
}

export function validateAndRewriteCoreSymbol(name: string): string {
  if (!CORE_SUPPORTED_SYMBOLS.has(name)) {
    throw new Error(
        `Importing unexpected symbol ${name} while compiling ${ANGULAR_CORE_SPECIFIER}`);
  }
  return CORE_SUPPORTED_SYMBOLS.get(name) !;
}
