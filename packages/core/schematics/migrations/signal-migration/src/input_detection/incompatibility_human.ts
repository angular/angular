/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassIncompatibilityReason, InputIncompatibilityReason} from './incompatibility';

/**
 * Gets human-readable message information for the given input incompatibility.
 * This text will be used by the language service, or CLI-based migration.
 */
export function getMessageForInputIncompatibility(reason: InputIncompatibilityReason): {
  short: string;
  extra: string;
} {
  switch (reason) {
    case InputIncompatibilityReason.Accessor:
      return {
        short: 'Accessor inputs cannot be migrated as they are too complex.',
        extra:
          'The migration potentially requires usage of `effect` or `computed`, but ' +
          'the intent is unclear. The migration cannot safely migrate.',
      };
    case InputIncompatibilityReason.OverriddenByDerivedClass:
      return {
        short: 'The input cannot be migrated because the field is overridden by a subclass.',
        extra: 'The field in the subclass is not an input, so migrating would break your build.',
      };
    case InputIncompatibilityReason.ParentIsIncompatible:
      return {
        short: 'This input is inherited from a superclass, but the parent cannot be migrated.',
        extra: 'Migrating this input would cause your build to fail.',
      };
    case InputIncompatibilityReason.PotentiallyNarrowedInTemplateButNoSupportYet:
      return {
        short:
          'This input is used in a control flow expression (e.g. `@if` or `*ngIf`) and ' +
          'migrating would break narrowing currently.',
        extra: `In the future, Angular intends to support narrowing of signals.`,
      };
    case InputIncompatibilityReason.RedeclaredViaDerivedClassInputsArray:
      return {
        short: 'The input is overridden by a subclass that cannot be migrated.',
        extra:
          'The subclass re-declares this input via the `inputs` array in @Directive/@Component. ' +
          'Migrating this input would break your build because the subclass input cannot be migrated.',
      };
    case InputIncompatibilityReason.RequiredInputButNoGoodExplicitTypeExtractable:
      return {
        short: `Input is required, but the migration cannot determine a good type for the input.`,
        extra: 'Consider adding an explicit type to make the migration possible.',
      };
    case InputIncompatibilityReason.SkippedViaConfigFilter:
      return {
        short: `This input is not part of the current migration scope.`,
        extra: 'Skipped via migration config.',
      };
    case InputIncompatibilityReason.SpyOnThatOverwritesField:
      return {
        short: 'A jasmine `spyOn` call spies on this input. This breaks with signal inputs.',
        extra: `Migration cannot safely migrate as "spyOn" writes to the input. Signal inputs are readonly.`,
      };
    case InputIncompatibilityReason.TypeConflictWithBaseClass:
      return {
        short:
          'This input overrides a field from a superclass, while the superclass field is not migrated.',
        extra: 'Migrating the input would break your build because of a type conflict then.',
      };
    case InputIncompatibilityReason.WriteAssignment:
      return {
        short: 'Your application code writes to the input. This prevents migration.',
        extra: 'Signal inputs are readonly, so migrating would break your build.',
      };
    case InputIncompatibilityReason.OutsideOfMigrationScope:
      return {
        short: 'This input is not part of any source files in your project.',
        extra: 'The migration excludes inputs if no source file declaring the input was seen.',
      };
  }
}

/**
 * Gets human-readable message information for the given input class incompatibility.
 * This text will be used by the language service, or CLI-based migration.
 */
export function getMessageForClassIncompatibility(reason: ClassIncompatibilityReason): {
  short: string;
  extra: string;
} {
  switch (reason) {
    case ClassIncompatibilityReason.InputOwningClassReferencedInClassProperty:
      return {
        short: 'Class of this input is referenced in the signature of another class.',
        extra:
          'The other class is likely typed to expect a non-migrated field, so ' +
          'migration is skipped to not break your build.',
      };
    case ClassIncompatibilityReason.ClassManuallyInstantiated:
      return {
        short:
          'Class of this input is manually instantiated. ' +
          'This is discouraged and prevents migration',
        extra:
          'Signal inputs require a DI injection context. Manually instantiating ' +
          'breaks this requirement in some cases, so the migration is skipped.',
      };
  }
}
