/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ExternalReference} from '@angular/compiler';
import ts from 'typescript';

export function coreHasSymbol(
  program: ts.Program,
  symbol: ExternalReference,
  coreRelativePotentialFiles: string[],
): boolean | null {
  const checker = program.getTypeChecker();

  for (const sf of program.getSourceFiles()) {
    if (!sf.isDeclarationFile) {
      continue;
    }
    if (!coreRelativePotentialFiles.some((s) => sf.fileName.endsWith(`/@angular/core/${s}`))) {
      continue;
    }
    const sym = checker.getSymbolAtLocation(sf);
    if (sym === undefined || sym.exports === undefined) {
      continue;
    }
    if (sym.exports.has(symbol.name as ts.__String)) {
      return true;
    }
  }
  return null;
}
