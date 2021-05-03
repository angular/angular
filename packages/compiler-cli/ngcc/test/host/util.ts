/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Trait, TraitState} from '@angular/compiler-cli/src/ngtsc/transform';
import * as ts from 'typescript';

import {SemanticSymbol} from '../../../src/ngtsc/incremental/semantic_graph';
import {CtorParameter, TypeValueReferenceKind} from '../../../src/ngtsc/reflection';

/**
 * Check that a given list of `CtorParameter`s has `typeValueReference`s of specific `ts.Identifier`
 * names.
 */
export function expectTypeValueReferencesForParameters(
    parameters: CtorParameter[], expectedParams: (string|null)[],
    fromModule: (string|null)[] = []) {
  parameters!.forEach((param, idx) => {
    const expected = expectedParams[idx];
    if (expected !== null) {
      if (param.typeValueReference.kind === TypeValueReferenceKind.UNAVAILABLE) {
        fail(`Incorrect typeValueReference generated for ${param.name}, expected "${
            expected}" because "${param.typeValueReference.reason}"`);
      } else if (
          param.typeValueReference.kind === TypeValueReferenceKind.LOCAL &&
          fromModule[idx] != null) {
        fail(`Incorrect typeValueReference generated for ${param.name}, expected non-LOCAL (from ${
            fromModule[idx]}) but was marked LOCAL`);
      } else if (
          param.typeValueReference.kind !== TypeValueReferenceKind.LOCAL &&
          fromModule[idx] == null) {
        fail(`Incorrect typeValueReference generated for ${
            param.name}, expected LOCAL but was imported from ${
            param.typeValueReference.moduleName}`);
      } else if (param.typeValueReference.kind === TypeValueReferenceKind.LOCAL) {
        if (!ts.isIdentifier(param.typeValueReference.expression) &&
            !ts.isPropertyAccessExpression(param.typeValueReference.expression)) {
          fail(`Incorrect typeValueReference generated for ${
              param.name}, expected an identifier but got "${
              param.typeValueReference.expression.getText()}"`);
        } else {
          expect(param.typeValueReference.expression.getText()).toEqual(expected);
        }
      } else if (param.typeValueReference.kind === TypeValueReferenceKind.IMPORTED) {
        expect(param.typeValueReference.moduleName).toBe(fromModule[idx]!);
        expect(param.typeValueReference.importedName).toBe(expected);
      }
    }
  });
}

export function getTraitDiagnostics(trait: Trait<unknown, unknown, SemanticSymbol|null, unknown>):
    ts.Diagnostic[]|null {
  if (trait.state === TraitState.Analyzed) {
    return trait.analysisDiagnostics;
  } else if (trait.state === TraitState.Resolved) {
    const diags = [
      ...(trait.analysisDiagnostics ?? []),
      ...(trait.resolveDiagnostics ?? []),
    ];
    return diags.length > 0 ? diags : null;
  } else {
    return null;
  }
}
