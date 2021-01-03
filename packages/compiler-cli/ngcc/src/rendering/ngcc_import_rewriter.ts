
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImportRewriter, validateAndRewriteCoreSymbol} from '../../../src/ngtsc/imports';

export class NgccFlatImportRewriter implements ImportRewriter {
  shouldImportSymbol(symbol: string, specifier: string): boolean {
    if (specifier === '@angular/core') {
      // Don't use imports for @angular/core symbols in a flat bundle, as they'll be visible
      // directly.
      return false;
    } else {
      return true;
    }
  }

  rewriteSymbol(symbol: string, specifier: string): string {
    if (specifier === '@angular/core') {
      return validateAndRewriteCoreSymbol(symbol);
    } else {
      return symbol;
    }
  }

  rewriteSpecifier(originalModulePath: string, inContextOfFile: string): string {
    return originalModulePath;
  }
}
