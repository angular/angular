import * as ts from 'typescript';

/** Returns the original symbol from an node. */
export function getOriginalSymbolFromNode(node: ts.Node, checker: ts.TypeChecker) {
  const baseSymbol = checker.getSymbolAtLocation(node);

  if (baseSymbol && baseSymbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(baseSymbol);
  }

  return baseSymbol;
}
