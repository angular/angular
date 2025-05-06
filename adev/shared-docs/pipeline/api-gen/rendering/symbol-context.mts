/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * API pages are generated each package at a time.
 * This allows to use a global context to store the symbols and their corresponding module names.
 */

let symbols = new Map<string, string>();

// This is used to store the currently processed symbol (usually a class or an interface)
let currentSymbol: string | undefined;

export function setSymbols(newSymbols: Map<string, string>): void {
  symbols = newSymbols;
}

/**
 * Returns the module name of a symbol.
 * eg: 'ApplicationRef' => 'core', 'FormControl' => 'forms'
 * Also supports class.member, 'NgZone.runOutsideAngular => 'core'
 */
export function getModuleName(symbol: string): string | undefined {
  const moduleName = symbols.get(symbol);
  return moduleName?.replace('@angular/', '');
}

export function setCurrentSymbol(symbol: string): void {
  currentSymbol = symbol;
}

export function getCurrentSymbol(): string | undefined {
  return currentSymbol;
}

export function unknownSymbolMessage(link: string, symbol: string): string {
  return `WARNING: {@link ${link}} is invalid, ${symbol} or ${currentSymbol}.${symbol} is unknown in this context`;
}
