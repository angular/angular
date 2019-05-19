
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ImportRewriter, validateAndRewriteCoreSymbol} from '../../../src/ngtsc/imports';
import {ANGULAR_CORE_SPECIFIER, AbsoluteFsPath, ModuleSpecifier} from '../../../src/ngtsc/path';

export class NgccFlatImportRewriter implements ImportRewriter {
  shouldImportSymbol(symbol: string, specifier: ModuleSpecifier): boolean {
    if (specifier === ANGULAR_CORE_SPECIFIER) {
      // Don't use imports for @angular/core symbols in a flat bundle, as they'll be visible
      // directly.
      return false;
    } else {
      return true;
    }
  }

  rewriteSymbol(symbol: string, specifier: ModuleSpecifier): string {
    if (specifier === ANGULAR_CORE_SPECIFIER) {
      return validateAndRewriteCoreSymbol(symbol);
    } else {
      return symbol;
    }
  }

  rewriteSpecifier(originalModulePath: ModuleSpecifier, inContextOfFile: AbsoluteFsPath):
      ModuleSpecifier {
    return originalModulePath;
  }
}
