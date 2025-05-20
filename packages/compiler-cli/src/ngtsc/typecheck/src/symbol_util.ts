/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {Symbol, SymbolKind} from '../api';

/** Names of known signal functions. */
const SIGNAL_FNS = new Set([
  'WritableSignal',
  'Signal',
  'InputSignal',
  'InputSignalWithTransform',
  'ModelSignal',
]);

/** Returns whether a symbol is a reference to a signal. */
export function isSignalReference(symbol: Symbol): boolean {
  return (
    (symbol.kind === SymbolKind.Expression ||
      symbol.kind === SymbolKind.Variable ||
      symbol.kind === SymbolKind.LetDeclaration) &&
    // Note that `tsType.symbol` isn't optional in the typings,
    // but it appears that it can be undefined at runtime.
    ((symbol.tsType.symbol !== undefined && isSignalSymbol(symbol.tsType.symbol)) ||
      (symbol.tsType.aliasSymbol !== undefined && isSignalSymbol(symbol.tsType.aliasSymbol)))
  );
}

/** Checks whether a symbol points to a signal. */
function isSignalSymbol(symbol: ts.Symbol): boolean {
  const declarations = symbol.getDeclarations();

  return (
    declarations !== undefined &&
    declarations.some((decl) => {
      const fileName = decl.getSourceFile().fileName;

      return (
        (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) &&
        SIGNAL_FNS.has(decl.name.text) &&
        (fileName.includes('@angular/core') ||
          fileName.includes('angular2/rc/packages/core') ||
          fileName.includes('bin/packages/core')) // for local usage in some tests
      );
    })
  );
}
