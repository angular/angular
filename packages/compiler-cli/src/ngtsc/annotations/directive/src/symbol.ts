/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  areTypeParametersEqual,
  isArrayEqual,
  isSetEqual,
  isSymbolEqual,
  SemanticSymbol,
  SemanticTypeParameter,
} from '../../../incremental/semantic_graph';
import {
  ClassPropertyMapping,
  DirectiveTypeCheckMeta,
  InputMapping,
  InputOrOutput,
  TemplateGuardMeta,
} from '../../../metadata';
import {ClassDeclaration} from '../../../reflection';

/**
 * Represents an Angular directive. Components are represented by `ComponentSymbol`, which inherits
 * from this symbol.
 */
export class DirectiveSymbol extends SemanticSymbol {
  baseClass: SemanticSymbol | null = null;

  constructor(
    decl: ClassDeclaration,
    public readonly selector: string | null,
    public readonly inputs: ClassPropertyMapping<InputMapping>,
    public readonly outputs: ClassPropertyMapping,
    public readonly exportAs: string[] | null,
    public readonly typeCheckMeta: DirectiveTypeCheckMeta,
    public readonly typeParameters: SemanticTypeParameter[] | null,
  ) {
    super(decl);
  }

  override isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    // Note: since components and directives have exactly the same items contributing to their
    // public API, it is okay for a directive to change into a component and vice versa without
    // the API being affected.
    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }

    // Directives and components have a public API of:
    //  1. Their selector.
    //  2. The binding names of their inputs and outputs; a change in ordering is also considered
    //     to be a change in public API.
    //  3. The list of exportAs names and its ordering.
    return (
      this.selector !== previousSymbol.selector ||
      !isArrayEqual(this.inputs.propertyNames, previousSymbol.inputs.propertyNames) ||
      !isArrayEqual(this.outputs.propertyNames, previousSymbol.outputs.propertyNames) ||
      !isArrayEqual(this.exportAs, previousSymbol.exportAs)
    );
  }

  override isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    // If the public API of the directive has changed, then so has its type-check API.
    if (this.isPublicApiAffected(previousSymbol)) {
      return true;
    }

    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }

    // The type-check block also depends on the class property names, as writes property bindings
    // directly into the backing fields.
    if (
      !isArrayEqual(
        Array.from(this.inputs),
        Array.from(previousSymbol.inputs),
        isInputMappingEqual,
      ) ||
      !isArrayEqual(
        Array.from(this.outputs),
        Array.from(previousSymbol.outputs),
        isInputOrOutputEqual,
      )
    ) {
      return true;
    }

    // The type parameters of a directive are emitted into the type constructors in the type-check
    // block of a component, so if the type parameters are not considered equal then consider the
    // type-check API of this directive to be affected.
    if (!areTypeParametersEqual(this.typeParameters, previousSymbol.typeParameters)) {
      return true;
    }

    // The type-check metadata is used during TCB code generation, so any changes should invalidate
    // prior type-check files.
    if (!isTypeCheckMetaEqual(this.typeCheckMeta, previousSymbol.typeCheckMeta)) {
      return true;
    }

    // Changing the base class of a directive means that its inputs/outputs etc may have changed,
    // so the type-check block of components that use this directive needs to be regenerated.
    if (!isBaseClassEqual(this.baseClass, previousSymbol.baseClass)) {
      return true;
    }

    return false;
  }
}

function isInputMappingEqual(current: InputMapping, previous: InputMapping): boolean {
  return isInputOrOutputEqual(current, previous) && current.required === previous.required;
}

function isInputOrOutputEqual(current: InputOrOutput, previous: InputOrOutput): boolean {
  return (
    current.classPropertyName === previous.classPropertyName &&
    current.bindingPropertyName === previous.bindingPropertyName &&
    current.isSignal === previous.isSignal
  );
}

function isTypeCheckMetaEqual(
  current: DirectiveTypeCheckMeta,
  previous: DirectiveTypeCheckMeta,
): boolean {
  if (current.hasNgTemplateContextGuard !== previous.hasNgTemplateContextGuard) {
    return false;
  }
  if (current.isGeneric !== previous.isGeneric) {
    // Note: changes in the number of type parameters is also considered in
    // `areTypeParametersEqual` so this check is technically not needed; it is done anyway for
    // completeness in terms of whether the `DirectiveTypeCheckMeta` struct itself compares
    // equal or not.
    return false;
  }
  if (!isArrayEqual(current.ngTemplateGuards, previous.ngTemplateGuards, isTemplateGuardEqual)) {
    return false;
  }
  if (!isSetEqual(current.coercedInputFields, previous.coercedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.restrictedInputFields, previous.restrictedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.stringLiteralInputFields, previous.stringLiteralInputFields)) {
    return false;
  }
  if (!isSetEqual(current.undeclaredInputFields, previous.undeclaredInputFields)) {
    return false;
  }
  return true;
}

function isTemplateGuardEqual(current: TemplateGuardMeta, previous: TemplateGuardMeta): boolean {
  return current.inputName === previous.inputName && current.type === previous.type;
}

function isBaseClassEqual(
  current: SemanticSymbol | null,
  previous: SemanticSymbol | null,
): boolean {
  if (current === null || previous === null) {
    return current === previous;
  }

  return isSymbolEqual(current, previous);
}
