/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Reasons why an input cannot be migrated.
 *
 * Higher values of incompatibility reasons indicate a more significant
 * incompatibility reason. Lower ones may be overridden by higher ones.
 * */
export enum InputIncompatibilityReason {
  OverriddenByDerivedClass = 1,
  RedeclaredViaDerivedClassInputsArray = 2,
  TypeConflictWithBaseClass = 3,
  ParentIsIncompatible = 4,
  SpyOnThatOverwritesField = 5,
  PotentiallyNarrowedInTemplateButNoSupportYet = 6,
  RequiredInputButNoGoodExplicitTypeExtractable = 7,
  InputWithQuestionMarkButNoGoodExplicitTypeExtractable = 8,
  WriteAssignment = 9,
  Accessor = 10,
  OutsideOfMigrationScope = 11,
  SkippedViaConfigFilter = 12,
}

/** Reasons why a whole class and its inputs cannot be migrated. */
export enum ClassIncompatibilityReason {
  ClassManuallyInstantiated,
  InputOwningClassReferencedInClassProperty,
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

/** Picks the more significant input compatibility. */
export function pickInputIncompatibility(
  a: InputMemberIncompatibility,
  b: InputMemberIncompatibility | null,
): InputMemberIncompatibility {
  if (b === null) {
    return a;
  }
  if (a.reason < b.reason) {
    return b;
  }
  return a;
}
