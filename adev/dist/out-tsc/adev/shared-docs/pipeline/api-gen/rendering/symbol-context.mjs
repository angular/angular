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
let symbols = {};
// This is used to store the currently processed symbol (usually a class or an interface)
let currentSymbol;
export function setCurrentSymbol(symbol) {
  currentSymbol = symbol;
}
export function getSymbols() {
  return symbols;
}
export function getCurrentSymbol() {
  return currentSymbol;
}
export function setSymbols(newSymbols) {
  symbols = newSymbols;
}
export function getSymbolUrl(symbol) {
  return sharedGetSymbolUrl(symbol, symbols);
}
export function unknownSymbolMessage(link, symbol) {
  return `WARNING: {@link ${link}} is invalid, ${symbol} or ${currentSymbol}.${symbol} is unknown in this context`;
}
//# sourceMappingURL=symbol-context.mjs.map
