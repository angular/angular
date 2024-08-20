/**
 * API pages are generated each package at a time.
 * This allows to use a global context to store the symbols and their corresponding module names.
 */

let symbols = new Map<string, string>();

export function setSymbols(newSymbols: Map<string, string>): void {
  symbols = newSymbols;
}

/**
 * Returns the module name of a symbol.
 * eg: 'ApplicationRef' => 'core', 'FormControl' => 'forms'
 */
export function getModuleName(symbol: string): string | undefined {
  return symbols.get(symbol)?.replace('@angular/', '');
}
