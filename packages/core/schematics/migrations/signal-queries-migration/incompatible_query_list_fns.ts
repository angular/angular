/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClassFieldDescriptor} from '../signal-migration/src';
import {
  isHostBindingReference,
  isTemplateReference,
  isTsReference,
  Reference,
} from '../signal-migration/src/passes/reference_resolution/reference_kinds';
import type {CompilationUnitData} from './migration';
import {checkNonTsReferenceAccessesField, checkTsReferenceAccessesField} from './property_accesses';

const problematicQueryListMethods = [
  'dirty',
  'changes',
  'setDirty',
  'reset',
  'notifyOnChanges',
  'destroy',
];

export function checkForIncompatibleQueryListAccesses(
  ref: Reference<ClassFieldDescriptor>,
  result: CompilationUnitData,
) {
  if (isTsReference(ref)) {
    for (const problematicFn of problematicQueryListMethods) {
      const access = checkTsReferenceAccessesField(ref, problematicFn);
      if (access !== null) {
        result.potentialProblematicReferenceForMultiQueries[ref.target.key] = true;
        return;
      }
    }
  }

  if (isHostBindingReference(ref) || isTemplateReference(ref)) {
    for (const problematicFn of problematicQueryListMethods) {
      const access = checkNonTsReferenceAccessesField(ref, problematicFn);
      if (access !== null) {
        result.potentialProblematicReferenceForMultiQueries[ref.target.key] = true;
        return;
      }
    }
  }
}
