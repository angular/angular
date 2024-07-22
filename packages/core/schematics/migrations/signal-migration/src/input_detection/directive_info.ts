/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ExtractedInput} from './input_decorator';
import {InputDescriptor, InputUniqueKey} from '../utils/input_id';
import {ClassIncompatibilityReason, InputMemberIncompatibility} from './incompatibility';

/**
 * Class that holds information about a given directive and its input fields.
 */
export class DirectiveInfo {
  /**
   * Map of inputs detected in the given class.
   * Maps string-based input ids to the detailed input metadata.
   */
  inputFields = new Map<InputUniqueKey, {descriptor: InputDescriptor; metadata: ExtractedInput}>();

  /** Map of input IDs and their incompatibilities. */
  memberIncompatibility = new Map<InputUniqueKey, InputMemberIncompatibility>();

  /** Whether the whole class is incompatible. */
  incompatible: ClassIncompatibilityReason | null = null;

  constructor(public clazz: ts.ClassDeclaration) {}

  /**
   * Checks whether the class is skipped for migration because all of
   * the inputs are marked as incompatible, or the class itself.
   */
  isClassSkippedForMigration(): boolean {
    return (
      this.incompatible !== null ||
      Array.from(this.inputFields.values()).every(({descriptor}) =>
        this.isInputMemberIncompatible(descriptor),
      )
    );
  }

  /**
   * Whether the given input member is incompatible. If the class is incompatible,
   * then the member is as well.
   */
  isInputMemberIncompatible(input: InputDescriptor): boolean {
    return this.incompatible !== null || this.memberIncompatibility.has(input.key);
  }
}
