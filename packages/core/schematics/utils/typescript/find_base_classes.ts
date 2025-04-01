/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {getBaseTypeIdentifiers} from './class_declaration';

/** Gets all base class declarations of the specified class declaration. */
export function findBaseClassDeclarations(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker) {
  const result: {identifier: ts.Identifier; node: ts.ClassDeclaration}[] = [];
  let currentClass = node;

  while (currentClass) {
    const baseTypes = getBaseTypeIdentifiers(currentClass);
    if (!baseTypes || baseTypes.length !== 1) {
      break;
    }
    const symbol = typeChecker.getTypeAtLocation(baseTypes[0]).getSymbol();
    // Note: `ts.Symbol#valueDeclaration` can be undefined. TypeScript has an incorrect type
    // for this: https://github.com/microsoft/TypeScript/issues/24706.
    if (!symbol || !symbol.valueDeclaration || !ts.isClassDeclaration(symbol.valueDeclaration)) {
      break;
    }
    result.push({identifier: baseTypes[0], node: symbol.valueDeclaration});
    currentClass = symbol.valueDeclaration;
  }
  return result;
}
