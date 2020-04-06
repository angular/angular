
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {CtorParameter} from '../../../src/ngtsc/reflection';

/**
 * Check that a given list of `CtorParameter`s has `typeValueReference`s of specific `ts.Identifier`
 * names.
 */
export function expectTypeValueReferencesForParameters(
    parameters: CtorParameter[], expectedParams: (string|null)[], fromModule: string|null = null) {
  parameters!.forEach((param, idx) => {
    const expected = expectedParams[idx];
    if (expected !== null) {
      if (param.typeValueReference === null) {
        fail(`Incorrect typeValueReference generated, expected ${expected}`);
      } else if (param.typeValueReference.local && fromModule !== null) {
        fail(`Incorrect typeValueReference generated, expected non-local`);
      } else if (!param.typeValueReference.local && fromModule === null) {
        fail(`Incorrect typeValueReference generated, expected local`);
      } else if (param.typeValueReference.local) {
        if (!ts.isIdentifier(param.typeValueReference.expression)) {
          fail(`Incorrect typeValueReference generated, expected identifer`);
        } else {
          expect(param.typeValueReference.expression.text).toEqual(expected);
        }
      } else if (param.typeValueReference !== null) {
        expect(param.typeValueReference.moduleName).toBe(fromModule!);
        expect(param.typeValueReference.name).toBe(expected);
      }
    }
  });
}
