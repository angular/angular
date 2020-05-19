/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '../src/types';

export const EMPTY_SYMBOL_TABLE: Readonly<ng.SymbolTable> = {
  size: 0,
  get: () => undefined,
  has: () => false,
  values: () => [],
};

/**
 * A factory function that returns a symbol table that contains all global symbols
 * available in an interpolation scope in a template.
 * This function creates the table the first time it is called, and return a cached
 * value for all subsequent calls.
 */
export const createGlobalSymbolTable: (query: ng.SymbolQuery) => ng.SymbolTable = (function() {
  let GLOBAL_SYMBOL_TABLE: ng.SymbolTable|undefined;
  return function(query: ng.SymbolQuery) {
    if (GLOBAL_SYMBOL_TABLE) {
      return GLOBAL_SYMBOL_TABLE;
    }
    GLOBAL_SYMBOL_TABLE = query.createSymbolTable([
      // The `$any()` method casts the type of an expression to `any`.
      // https://angular.io/guide/template-syntax#the-any-type-cast-function
      {
        name: '$any',
        kind: 'method',
        type: {
          name: '$any',
          kind: 'method',
          type: undefined,
          language: 'typescript',
          container: undefined,
          public: true,
          callable: true,
          definition: undefined,
          nullable: false,
          documentation: [{
            kind: 'text',
            text: 'function to cast an expression to the `any` type',
          }],
          members: () => EMPTY_SYMBOL_TABLE,
          signatures: () => [],
          selectSignature(args: ng.Symbol[]) {
            if (args.length !== 1) {
              return;
            }
            return {
              arguments: EMPTY_SYMBOL_TABLE,  // not used
              result: query.getBuiltinType(ng.BuiltinType.Any),
            };
          },
          indexed: () => undefined,
          typeArguments: () => undefined,
        },
      },
    ]);
    return GLOBAL_SYMBOL_TABLE;
  };
})();
