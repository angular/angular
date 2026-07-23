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

/**
 * Index of known members per symbol for the currently processed package. Populated alongside
 * `symbols` so we can validate `#member` fragments in `{@link /api/<module>/<Symbol>#<member>}`
 * tags at build time.
 *
 * Per-package scope: only symbols belonging to the package currently being rendered are present;
 * cross-package member fragments are not validated here.
 */
let symbolMembers: Map<string, Set<string>> = new Map();

// This is used to store the currently processed symbol (usually a class or an interface)
let currentSymbol: string | undefined;
export function setCurrentSymbol(symbol: string): void {
  currentSymbol = symbol;
}

/** Convert Record<string, string> to ApiEntries format */
export function getSymbolsAsApiEntries(): Record<string, {moduleName: string}> {
  const result: Record<string, {moduleName: string}> = {};

  for (const symbol in symbols) {
    result[symbol] = {moduleName: symbols[symbol]};
  }

  return result;
}

export function getCurrentSymbol(): string | undefined {
  return currentSymbol;
}

export function setSymbols(newSymbols: Record<string, string>): void {
  symbols = newSymbols;
}

/** Set the index of known members per symbol for the currently processed package. */
export function setSymbolMembers(newSymbolMembers: Map<string, Set<string>>): void {
  symbolMembers = newSymbolMembers;
}

/** Get the set of known members for a symbol, or `undefined` if the symbol isn't tracked. */
export function getSymbolMembers(symbol: string): Set<string> | undefined {
  return symbolMembers.get(symbol);
}

export function getSymbolUrl(symbol: string): string | undefined {
  return sharedGetSymbolUrl(symbol, getSymbolsAsApiEntries());
}

export function unknownSymbolMessage(link: string, symbol: string): string {
  return `WARNING: {@link ${link}} is invalid, ${symbol} or ${currentSymbol}.${symbol} is unknown in this context`;
}
