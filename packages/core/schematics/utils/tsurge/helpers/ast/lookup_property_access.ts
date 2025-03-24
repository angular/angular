/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Attempts to look up the given property access chain using
 * the type checker.
 *
 * Notably this is not as safe as using the type checker directly to
 * retrieve symbols of a given identifier, but in some cases this is
 * a necessary approach to compensate e.g. for a lack of TCB information
 * when processing Angular templates.
 *
 * The path is a list of properties to be accessed sequentially on the
 * given type.
 */
export function lookupPropertyAccess(
  checker: ts.TypeChecker,
  type: ts.Type,
  path: string[],
  options: {ignoreNullability?: boolean} = {},
): {symbol: ts.Symbol; type: ts.Type} | null {
  let symbol: ts.Symbol | null = null;

  for (const propName of path) {
    // Note: We support assuming `NonNullable` for the pathl This is necessary
    // in some situations as otherwise the lookups would fail to resolve the target
    // symbol just because of e.g. a ternary. This is used in the signal input migration
    // for host bindings.
    type = options.ignoreNullability ? type.getNonNullableType() : type;

    const propSymbol = type.getProperty(propName);
    if (propSymbol === undefined) {
      return null;
    }
    symbol = propSymbol;
    type = checker.getTypeOfSymbol(propSymbol);
  }

  if (symbol === null) {
    return null;
  }

  return {symbol, type};
}
