
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassDeclaration, CtorParameter} from '../../../src/ngtsc/reflection';

/**
 * Check that a given list of `CtorParameter`s has `typeValueReference`s of specific `ts.Identifier`
 * names.
 */
export function expectTypeValueReferencesForParameters(
    parameters: CtorParameter[], expectedParams: (string | null)[]) {
  parameters !.forEach((param, idx) => {
    const expected = expectedParams[idx];
    if (expected !== null) {
      if (param.typeValueReference === null || !param.typeValueReference.local ||
          !ts.isIdentifier(param.typeValueReference.expression)) {
        fail(`Incorrect typeValueReference generated, expected ${expected}`);
      } else {
        expect(param.typeValueReference.expression.text).toEqual(expected);
      }
    }
  });
}

export function isNamedClassDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.ClassDeclaration> {
  return ts.isClassDeclaration(node) && (node.name !== undefined);
}

export function isNamedFunctionDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.FunctionDeclaration> {
  return ts.isFunctionDeclaration(node) && (node.name !== undefined);
}

export function isNamedVariableDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.VariableDeclaration> {
  return ts.isVariableDeclaration(node) && (node.name !== undefined);
}
