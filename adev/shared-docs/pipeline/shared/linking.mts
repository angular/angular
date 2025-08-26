/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// In some case we know that we don't want to link a symbol
// Example when there is a conflict between API entries and compiler features.
// eg: "animate" is both an Animation API entry and an template instruction "animation.enter"
const LINK_EXEMPT = new Set(['animate', 'animate.enter', 'animate.leave']);

export function shouldLinkSymbol(symbol: string): boolean {
  return !LINK_EXEMPT.has(symbol);
}

export type ApiEntries = Record<string, string>; // symbolName -> moduleName (without @angular/ prefix)

/**
 * Extracts the symbol name and property name from a symbol string.
 * eg:
 *   foobar() => {symbolName: 'foobar', propName: null}
 *   ApplicationRef.tick = > {symbolName: 'ApplicationRef', propName: 'tick'}
 *   ApplicationRef.tick() = > {symbolName: 'ApplicationRef', propName: 'tick'}
 *   @Component => {symbolName: 'Component', propName: null}
 */
export function extractFromSymbol(symbol: string): {propName: string | null; symbolName: string} {
  let propName: string | undefined;
  let symbolName = symbol;
  // we want to match functions when they have parentheses
  if (symbolName.endsWith('()')) {
    symbolName = symbolName.slice(0, -2);
  }

  if (symbolName.startsWith('@')) {
    symbolName = symbolName.slice(1);
  }
  if (symbolName.includes('#')) {
    [symbolName, propName] = symbolName.split('#');
  } else if (symbolName.includes('.')) {
    [symbolName, propName] = symbolName.split('.');
  }

  return {propName: propName ?? null, symbolName: symbolName};
}

export function getSymbolUrl(symbol: string, apiEntries: ApiEntries): string | undefined {
  if (hasMoreThanOneDot(symbol) || !shouldLinkSymbol(symbol)) {
    return undefined;
  }

  const {symbolName, propName} = extractFromSymbol(symbol);
  // We don't want to match entries like "constructor"
  const apiEntry = Object.hasOwn(apiEntries, symbolName) && apiEntries[symbolName];

  return apiEntry ? `/api/${apiEntry}/${symbolName}${propName ? `#${propName}` : ''}` : undefined;
}

function hasMoreThanOneDot(str: string) {
  return str.split('.').length - 1 > 1;
}
