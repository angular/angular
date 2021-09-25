/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {ClassDeclaration} from '../../../reflection';
import {isArrayEqual} from './util';

/**
 * Describes a generic type parameter of a semantic symbol. A class declaration with type parameters
 * needs special consideration in certain contexts. For example, template type-check blocks may
 * contain type constructors of used directives which include the type parameters of the directive.
 * As a consequence, if a change is made that affects the type parameters of said directive, any
 * template type-check blocks that use the directive need to be regenerated.
 *
 * This type represents a single generic type parameter. It currently only tracks whether the
 * type parameter has a constraint, i.e. has an `extends` clause. When a constraint is present, we
 * currently assume that the type parameter is affected in each incremental rebuild; proving that
 * a type parameter with constraint is not affected is non-trivial as it requires full semantic
 * understanding of the type constraint.
 */
export interface SemanticTypeParameter {
  /**
   * Whether a type constraint, i.e. an `extends` clause is present on the type parameter.
   */
  hasGenericTypeBound: boolean;
}

/**
 * Converts the type parameters of the given class into their semantic representation. If the class
 * does not have any type parameters, then `null` is returned.
 */
export function extractSemanticTypeParameters(node: ClassDeclaration): SemanticTypeParameter[]|
    null {
  if (!ts.isClassDeclaration(node) || node.typeParameters === undefined) {
    return null;
  }

  return node.typeParameters.map(
      typeParam => ({hasGenericTypeBound: typeParam.constraint !== undefined}));
}

/**
 * Compares the list of type parameters to determine if they can be considered equal.
 */
export function areTypeParametersEqual(
    current: SemanticTypeParameter[]|null, previous: SemanticTypeParameter[]|null): boolean {
  // First compare all type parameters one-to-one; any differences mean that the list of type
  // parameters has changed.
  if (!isArrayEqual(current, previous, isTypeParameterEqual)) {
    return false;
  }

  // If there is a current list of type parameters and if any of them has a generic type constraint,
  // then the meaning of that type parameter may have changed without us being aware; as such we
  // have to assume that the type parameters have in fact changed.
  if (current !== null && current.some(typeParam => typeParam.hasGenericTypeBound)) {
    return false;
  }

  return true;
}

function isTypeParameterEqual(a: SemanticTypeParameter, b: SemanticTypeParameter): boolean {
  return a.hasGenericTypeBound === b.hasGenericTypeBound;
}
