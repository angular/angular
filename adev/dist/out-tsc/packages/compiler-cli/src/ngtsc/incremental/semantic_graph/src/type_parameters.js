/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {isArrayEqual} from './util';
/**
 * Converts the type parameters of the given class into their semantic representation. If the class
 * does not have any type parameters, then `null` is returned.
 */
export function extractSemanticTypeParameters(node) {
  if (!ts.isClassDeclaration(node) || node.typeParameters === undefined) {
    return null;
  }
  return node.typeParameters.map((typeParam) => ({
    hasGenericTypeBound: typeParam.constraint !== undefined,
  }));
}
/**
 * Compares the list of type parameters to determine if they can be considered equal.
 */
export function areTypeParametersEqual(current, previous) {
  // First compare all type parameters one-to-one; any differences mean that the list of type
  // parameters has changed.
  if (!isArrayEqual(current, previous, isTypeParameterEqual)) {
    return false;
  }
  // If there is a current list of type parameters and if any of them has a generic type constraint,
  // then the meaning of that type parameter may have changed without us being aware; as such we
  // have to assume that the type parameters have in fact changed.
  if (current !== null && current.some((typeParam) => typeParam.hasGenericTypeBound)) {
    return false;
  }
  return true;
}
function isTypeParameterEqual(a, b) {
  return a.hasGenericTypeBound === b.hasGenericTypeBound;
}
//# sourceMappingURL=type_parameters.js.map
