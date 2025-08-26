/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSymbolUrl as sharedGetSymbolUrl} from '../../shared/linking.mjs';

/**
 * API pages are generated each package at a time.
 * This allows us to use a global context to store the symbols and their corresponding module names.
 */

let symbols: Record<string, string> = {};

// This is used to store the currently processed symbol (usually a class or an interface)
let currentSymbol: string | undefined;
export function setCurrentSymbol(symbol: string): void {
  currentSymbol = symbol;
}

export function getCurrentSymbol(): string | undefined {
  return currentSymbol;
}

export function setSymbols(newSymbols: Record<string, string>): void {
  symbols = newSymbols;
}

export function getSymbolUrl(symbol: string): string | undefined {
  return sharedGetSymbolUrl(symbol, symbols);
}

export function unknownSymbolMessage(link: string, symbol: string): string {
  return `WARNING: {@link ${link}} is invalid, ${symbol} or ${currentSymbol}.${symbol} is unknown in this context`;
}
