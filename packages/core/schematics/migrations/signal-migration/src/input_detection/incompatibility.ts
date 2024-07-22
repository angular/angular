/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Reasons why an input cannot be migrated. */
export enum InputIncompatibilityReason {
  Accessor,
  WriteAssignment,
  OverriddenByDerivedClass,
  RedeclaredViaDerivedClassInputsArray,
  TypeConflictWithBaseClass,
  ParentIsIncompatible,
  SpyOnThatOverwritesField,
  NarrowedInTemplateButNotSupportedYetTODO,
  IgnoredBecauseOfLanguageServiceRefactoringRange,
  RequiredInputButNoGoodExplicitTypeExtractable,
}

/** Reasons why a whole class and its inputs cannot be migrated. */
export enum ClassIncompatibilityReason {
  ClassManuallyInstantiated,
  ClassReferencedInPotentiallyBadLocation,
}

/** Description of an input incompatibility and some helpful debug context. */
export interface InputMemberIncompatibility {
  reason: InputIncompatibilityReason;
  context: ts.Node | null;
}

/** Whether the given value refers to an input member incompatibility. */
export function isInputMemberIncompatibility(value: unknown): value is InputMemberIncompatibility {
  return (
    (value as Partial<InputMemberIncompatibility>).reason !== undefined &&
    (value as Partial<InputMemberIncompatibility>).context !== undefined &&
    InputIncompatibilityReason.hasOwnProperty(
      (value as Partial<InputMemberIncompatibility>).reason!,
    )
  );
}
