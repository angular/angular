/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export function getValueSymbolOfDeclaration(node: ts.Node, typeChecker: ts.TypeChecker): ts.Symbol|
    undefined {
  let symbol = typeChecker.getSymbolAtLocation(node);

  while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  return symbol;
}
