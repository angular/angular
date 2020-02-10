/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getBaseTypeIdentifiers} from '../../utils/typescript/class_declaration';

/** Gets all base class declarations of the specified class declaration. */
export function findBaseClassDeclarations(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker) {
  const result: {identifier: ts.Identifier, node: ts.ClassDeclaration}[] = [];
  let currentClass = node;

  while (currentClass) {
    const baseTypes = getBaseTypeIdentifiers(currentClass);
    if (!baseTypes || baseTypes.length !== 1) {
      break;
    }
    const symbol = typeChecker.getTypeAtLocation(baseTypes[0]).getSymbol();
    if (!symbol || !ts.isClassDeclaration(symbol.valueDeclaration)) {
      break;
    }
    result.push({identifier: baseTypes[0], node: symbol.valueDeclaration});
    currentClass = symbol.valueDeclaration;
  }
  return result;
}
