/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Reasons why a field cannot be migrated.
 *
 * Higher values of incompatibility reasons indicate a more significant
 * incompatibility reason. Lower ones may be overridden by higher ones.
 * */
export enum FieldIncompatibilityReason {
  OverriddenByDerivedClass = 1,
  RedeclaredViaDerivedClassInputsArray = 2,
  TypeConflictWithBaseClass = 3,
  ParentIsIncompatible = 4,
  DerivedIsIncompatible = 5,
  SpyOnThatOverwritesField = 6,
  PotentiallyNarrowedInTemplateButNoSupportYet = 7,
  SignalIncompatibleWithHostBinding = 8,
  SignalInput__RequiredButNoGoodExplicitTypeExtractable = 9,
  SignalInput__QuestionMarkButNoGoodExplicitTypeExtractable = 10,
  SignalQueries__QueryListProblematicFieldAccessed = 11,
  SignalQueries__IncompatibleMultiUnionType = 12,
  WriteAssignment = 13,
  Accessor = 14,
  OutsideOfMigrationScope = 15,
  SkippedViaConfigFilter = 16,
}

/** Field reasons that cannot be ignored. */
export const nonIgnorableFieldIncompatibilities: FieldIncompatibilityReason[] = [
  // Outside of scope fields should not be migrated. E.g. references to inputs in `node_modules/`.
  FieldIncompatibilityReason.OutsideOfMigrationScope,
  // Explicitly filtered fields cannot be skipped via best effort mode.
  FieldIncompatibilityReason.SkippedViaConfigFilter,
  // There is no good output for accessor fields.
  FieldIncompatibilityReason.Accessor,
  // There is no good output for such inputs. We can't perform "conversion".
  FieldIncompatibilityReason.SignalInput__RequiredButNoGoodExplicitTypeExtractable,
  FieldIncompatibilityReason.SignalInput__QuestionMarkButNoGoodExplicitTypeExtractable,
];

/** Reasons why a whole class and its fields cannot be migrated. */
export enum ClassIncompatibilityReason {
  ClassManuallyInstantiated,
  OwningClassReferencedInClassProperty,
}

/** Description of a field incompatibility and some helpful debug context. */
export interface FieldIncompatibility {
  reason: FieldIncompatibilityReason;
  context: ts.Node | null;
}

/** Whether the given value refers to an field incompatibility. */
export function isFieldIncompatibility(value: unknown): value is FieldIncompatibility {
  return (
    (value as Partial<FieldIncompatibility>).reason !== undefined &&
    (value as Partial<FieldIncompatibility>).context !== undefined &&
    FieldIncompatibilityReason.hasOwnProperty((value as Partial<FieldIncompatibility>).reason!)
  );
}

/** Picks the more significant field compatibility. */
export function pickFieldIncompatibility(
  a: FieldIncompatibility,
  b: FieldIncompatibility | null,
): FieldIncompatibility {
  if (b === null) {
    return a;
  }
  if (a.reason < b.reason) {
    return b;
  }
  return a;
}
