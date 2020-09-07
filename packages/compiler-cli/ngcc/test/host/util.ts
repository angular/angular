/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {CtorParameter, TypeValueReferenceKind} from '../../../src/ngtsc/reflection';

/**
 * Check that a given list of `CtorParameter`s has `typeValueReference`s of specific `ts.Identifier`
 * names.
 */
export function expectTypeValueReferencesForParameters(
    parameters: CtorParameter[], expectedParams: (string|null)[], fromModule: string|null = null) {
  parameters!.forEach((param, idx) => {
    const expected = expectedParams[idx];
    if (expected !== null) {
      if (param.typeValueReference.kind === TypeValueReferenceKind.UNAVAILABLE) {
        fail(`Incorrect typeValueReference generated, expected ${expected}`);
      } else if (
          param.typeValueReference.kind === TypeValueReferenceKind.LOCAL && fromModule !== null) {
        fail(`Incorrect typeValueReference generated, expected non-local`);
      } else if (
          param.typeValueReference.kind !== TypeValueReferenceKind.LOCAL && fromModule === null) {
        fail(`Incorrect typeValueReference generated, expected local`);
      } else if (param.typeValueReference.kind === TypeValueReferenceKind.LOCAL) {
        if (!ts.isIdentifier(param.typeValueReference.expression)) {
          fail(`Incorrect typeValueReference generated, expected identifier`);
        } else {
          expect(param.typeValueReference.expression.text).toEqual(expected);
        }
      } else if (param.typeValueReference.kind === TypeValueReferenceKind.IMPORTED) {
        expect(param.typeValueReference.moduleName).toBe(fromModule!);
        expect(param.typeValueReference.importedName).toBe(expected);
      }
    }
  });
}
