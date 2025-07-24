/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ExtractedInput} from './input_decorator';
import {InputDescriptor} from '../utils/input_id';
import {
  ClassIncompatibilityReason,
  FieldIncompatibility,
} from '../passes/problematic_patterns/incompatibility';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';

/**
 * Class that holds information about a given directive and its input fields.
 */
export class DirectiveInfo {
  /**
   * Map of inputs detected in the given class.
   * Maps string-based input ids to the detailed input metadata.
   */
  inputFields = new Map<
    ClassFieldUniqueKey,
    {descriptor: InputDescriptor; metadata: ExtractedInput}
  >();

  /** Map of input IDs and their incompatibilities. */
  memberIncompatibility = new Map<ClassFieldUniqueKey, FieldIncompatibility>();

  /**
   * Whether the whole class is incompatible.
   *
   * Class incompatibility precedes individual member incompatibility.
   * All members in the class are considered incompatible.
   */
  incompatible: ClassIncompatibilityReason | null = null;

  constructor(public clazz: ts.ClassDeclaration) {}

  /**
   * Checks whether there are any migrated inputs for the
   * given class.
   *
   * Returns `false` if all inputs are incompatible.
   */
  hasMigratedFields(): boolean {
    return Array.from(this.inputFields.values()).some(
      ({descriptor}) => !this.isInputMemberIncompatible(descriptor),
    );
  }

  /**
   * Whether the given input member is incompatible. If the class is incompatible,
   * then the member is as well.
   */
  isInputMemberIncompatible(input: InputDescriptor): boolean {
    return this.getInputMemberIncompatibility(input) !== null;
  }

  /** Get incompatibility of the given member, if it's incompatible for migration. */
  getInputMemberIncompatibility(
    input: InputDescriptor,
  ): ClassIncompatibilityReason | FieldIncompatibility | null {
    return this.memberIncompatibility.get(input.key) ?? this.incompatible ?? null;
  }
}
