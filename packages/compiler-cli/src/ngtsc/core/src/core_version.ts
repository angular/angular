/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExternalReference} from '@angular/compiler';
import ts from 'typescript';

export function coreHasSymbol(program: ts.Program, symbol: ExternalReference): boolean | null {
  const checker = program.getTypeChecker();
  for (const sf of program.getSourceFiles().filter(isMaybeCore)) {
    const sym = checker.getSymbolAtLocation(sf);
    if (sym === undefined || sym.exports === undefined) {
      continue;
    }
    if (!sym.exports.has('ɵɵtemplate' as ts.__String)) {
      // This is not @angular/core.
      continue;
    }
    return sym.exports.has(symbol.name as ts.__String);
  }
  // No @angular/core file found, so we have no information.
  return null;
}

export function isMaybeCore(sf: ts.SourceFile): boolean {
  return (
    sf.isDeclarationFile &&
    sf.fileName.includes('@angular/core') &&
    sf.fileName.endsWith('index.d.ts')
  );
}
