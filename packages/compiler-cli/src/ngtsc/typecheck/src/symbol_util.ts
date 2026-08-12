/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {Symbol, SymbolKind, TcbLocation, TemplateTypeChecker} from '../api';

/** Names of known signal functions. */
const SIGNAL_FNS = new Set([
  'WritableSignal',
  'Signal',
  'InputSignal',
  'InputSignalWithTransform',
  'ModelSignal',
]);

/** Returns whether a symbol is a reference to a signal. */

export function isSignalReference(symbol: Symbol, typeChecker: TemplateTypeChecker): boolean {
  let location: TcbLocation | null = null;
  let tcbTypeLocation: TcbLocation | undefined = undefined;
  if ('tcbLocation' in symbol) {
    location = (symbol as any).tcbLocation;
    tcbTypeLocation = (symbol as any).tcbTypeLocation;
  } else if ('localVarLocation' in symbol) {
    location = (symbol as any).localVarLocation;
  }

  if (location === null) {
    return false;
  }

  // We can trick getTypeOfSymbol since it just checks 'tcbLocation' and 'tcbTypeLocation'
  const mockSymbol: any = {tcbLocation: location};
  if (tcbTypeLocation !== undefined) {
    mockSymbol.tcbTypeLocation = tcbTypeLocation;
  }
  const type = typeChecker.getTypeOfSymbol(mockSymbol);

  if (!type) return false;

  return (
    (symbol.kind === SymbolKind.Expression ||
      symbol.kind === SymbolKind.Variable ||
      symbol.kind === SymbolKind.LetDeclaration) &&
    ((type.symbol !== undefined && isSignalSymbol(type.symbol)) ||
      (type.aliasSymbol !== undefined && isSignalSymbol(type.aliasSymbol)))
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
