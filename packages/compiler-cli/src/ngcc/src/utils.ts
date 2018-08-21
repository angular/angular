/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

export function getOriginalSymbol(checker: ts.TypeChecker): (symbol: ts.Symbol) => ts.Symbol {
  return function(symbol: ts.Symbol) {
    return ts.SymbolFlags.Alias & symbol.flags ? checker.getAliasedSymbol(symbol) : symbol;
  };
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return (value !== undefined) && (value !== null);
}

export function getNameText(name: ts.PropertyName | ts.BindingName): string {
  return ts.isIdentifier(name) || ts.isLiteralExpression(name) ? name.text : name.getText();
}
