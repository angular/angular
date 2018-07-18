/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Returns the original symbol from an node. */
export function getOriginalSymbolFromNode(node: ts.Node, checker: ts.TypeChecker) {
  const baseSymbol = checker.getSymbolAtLocation(node);

  // tslint:disable-next-line:no-bitwise
  if (baseSymbol && baseSymbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(baseSymbol);
  }

  return baseSymbol;
}
