/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A mapping of supported symbols that can be imported from within @angular/core, and the names by
 * which they're exported from r3_symbols.
 */
const CORE_SUPPORTED_SYMBOLS = new Map<string, string>([
  ['ɵɵdefineInjectable', 'ɵɵdefineInjectable'],
  ['ɵɵdefineService', 'ɵɵdefineService'],
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

/** The module name for Angular core. */
export const CORE_MODULE = '@angular/core';

/**
 * Validates that an imported symbol is a supported Angular core symbol and returns
 * the symbol name by which it is exported from `r3_symbols`.
 */
export function validateAndRewriteCoreSymbol(name: string): string {
  if (!CORE_SUPPORTED_SYMBOLS.has(name)) {
    throw new Error(`Importing unexpected symbol ${name} while compiling ${CORE_MODULE}`);
  }
  return CORE_SUPPORTED_SYMBOLS.get(name)!;
}
