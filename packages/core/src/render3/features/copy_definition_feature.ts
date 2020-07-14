/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentDef, DirectiveDef} from '../interfaces/definition';
import {isComponentDef} from '../interfaces/type_checks';

import {getSuperType} from './inherit_definition_feature';

/**
 * Fields which exist on either directive or component definitions, and need to be copied from
 * parent to child classes by the `ɵɵCopyDefinitionFeature`.
 */
const COPY_DIRECTIVE_FIELDS: (keyof DirectiveDef<unknown>)[] = [
  // The child class should use the providers of its parent.
  'providersResolver',

  // Not listed here are any fields which are handled by the `ɵɵInheritDefinitionFeature`, such
  // as inputs, outputs, and host binding functions.
];

/**
 * Fields which exist only on component definitions, and need to be copied from parent to child
 * classes by the `ɵɵCopyDefinitionFeature`.
 *
 * The type here allows any field of `ComponentDef` which is not also a property of `DirectiveDef`,
 * since those should go in `COPY_DIRECTIVE_FIELDS` above.
 */
const COPY_COMPONENT_FIELDS: Exclude<keyof ComponentDef<unknown>, keyof DirectiveDef<unknown>>[] = [
  // The child class should use the template function of its parent, including all template
  // semantics.
  'template',
  'decls',
  'consts',
  'vars',
  'onPush',
  'ngContentSelectors',

  // The child class should use the CSS styles of its parent, including all styling semantics.
  'styles',
  'encapsulation',

  // The child class should be checked by the runtime in the same way as its parent.
  'schemas',
];

/**
 * Copies the fields not handled by the `ɵɵInheritDefinitionFeature` from the supertype of a
 * definition.
 *
 * This exists primarily to support ngcc migration of an existing View Engine pattern, where an
 * entire decorator is inherited from a parent to a child class. When ngcc detects this case, it
 * generates a skeleton definition on the child class, and applies this feature.
 *
 * The `ɵɵCopyDefinitionFeature` then copies any needed fields from the parent class' definition,
 * including things like the component template function.
 *
 * @param definition The definition of a child class which inherits from a parent class with its
 * own definition.
 *
 * @codeGenApi
 */
export function ɵɵCopyDefinitionFeature(definition: DirectiveDef<any>|ComponentDef<any>): void {
  let superType = getSuperType(definition.type)!;

  let superDef: DirectiveDef<any>|ComponentDef<any>|undefined = undefined;
  if (isComponentDef(definition)) {
    // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
    superDef = superType.ɵcmp!;
  } else {
    // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
    superDef = superType.ɵdir!;
  }

  // Needed because `definition` fields are readonly.
  const defAny = (definition as any);

  // Copy over any fields that apply to either directives or components.
  for (const field of COPY_DIRECTIVE_FIELDS) {
    defAny[field] = superDef[field];
  }

  if (isComponentDef(superDef)) {
    // Copy over any component-specific fields.
    for (const field of COPY_COMPONENT_FIELDS) {
      defAny[field] = superDef[field];
    }
  }
}
