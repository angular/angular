/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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

/** Checks whether a node is referring to a specific import specifier. */
export function isReferenceToImport(
    typeChecker: ts.TypeChecker, node: ts.Node, importSpecifier: ts.ImportSpecifier): boolean {
  const nodeSymbol = typeChecker.getTypeAtLocation(node).getSymbol();
  const importSymbol = typeChecker.getTypeAtLocation(importSpecifier).getSymbol();
  return !!(nodeSymbol && importSymbol) &&
      nodeSymbol.valueDeclaration === importSymbol.valueDeclaration;
}
