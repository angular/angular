/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClassIncompatibilityReason, FieldIncompatibilityReason} from './incompatibility';

/**
 * Gets human-readable message information for the given field incompatibility.
 * This text will be used by the language service, or CLI-based migration.
 */
export function getMessageForFieldIncompatibility(
  reason: FieldIncompatibilityReason,
  fieldName: {single: string; plural: string},
): {
  short: string;
  extra: string;
} {
  switch (reason) {
    case FieldIncompatibilityReason.Accessor:
      return {
        short: `Accessor ${fieldName.plural} cannot be migrated as they are too complex.`,
        extra:
          'The migration potentially requires usage of `effect` or `computed`, but ' +
          'the intent is unclear. The migration cannot safely migrate.',
      };
    case FieldIncompatibilityReason.OverriddenByDerivedClass:
      return {
        short: `The ${fieldName.single} cannot be migrated because the field is overridden by a subclass.`,
        extra: 'The field in the subclass is not a signal, so migrating would break your build.',
      };
    case FieldIncompatibilityReason.ParentIsIncompatible:
      return {
        short: `This ${fieldName.single} is inherited from a superclass, but the parent cannot be migrated.`,
        extra: 'Migrating this field would cause your build to fail.',
      };
    case FieldIncompatibilityReason.DerivedIsIncompatible:
      return {
        short: `This ${fieldName.single} cannot be migrated because the field is overridden by a subclass.`,
        extra:
          'The field in the subclass is incompatible for migration, so migrating this field would ' +
          'break your build.',
      };
    case FieldIncompatibilityReason.SignalIncompatibleWithHostBinding:
      return {
        short:
          `This ${fieldName.single} is used in combination with \`@HostBinding\` and ` +
          `migrating would break.`,
        extra:
          `\`@HostBinding\` does not invoke the signal automatically and your code would ` +
          `break after migration. Use \`host\` of \`@Directive\`/\`@Component\`for host bindings.`,
      };
    case FieldIncompatibilityReason.PotentiallyNarrowedInTemplateButNoSupportYet:
      return {
        short:
          `This ${fieldName.single} is used in a control flow expression (e.g. \`@if\` or \`*ngIf\`) and ` +
          'migrating would break narrowing currently.',
        extra: `In the future, Angular intends to support narrowing of signals.`,
      };
    case FieldIncompatibilityReason.RedeclaredViaDerivedClassInputsArray:
      return {
        short: `The ${fieldName.single} is overridden by a subclass that cannot be migrated.`,
        extra:
          `The subclass overrides this ${fieldName.single} via the \`inputs\` array in @Directive/@Component. ` +
          'Migrating the field would break your build because the subclass field cannot be a signal.',
      };
    case FieldIncompatibilityReason.SignalInput__RequiredButNoGoodExplicitTypeExtractable:
      return {
        short: `Input is required, but the migration cannot determine a good type for the input.`,
        extra: 'Consider adding an explicit type to make the migration possible.',
      };
    case FieldIncompatibilityReason.SignalInput__QuestionMarkButNoGoodExplicitTypeExtractable:
      return {
        short: `Input is marked with a question mark. Migration could not determine a good type for the input.`,
        extra:
          'The migration needs to be able to resolve a type, so that it can include `undefined` in your type. ' +
          'Consider adding an explicit type to make the migration possible.',
      };
    case FieldIncompatibilityReason.SignalQueries__QueryListProblematicFieldAccessed:
      return {
        short: `There are references to this query that cannot be migrated automatically.`,
        extra: "For example, it's not possible to migrate `.changes` or `.dirty` trivially.",
      };
    case FieldIncompatibilityReason.SignalQueries__IncompatibleMultiUnionType:
      return {
        short: `Query type is too complex to automatically migrate.`,
        extra: "The new query API doesn't allow us to migrate safely without breaking your app.",
      };
    case FieldIncompatibilityReason.SkippedViaConfigFilter:
      return {
        short: `This ${fieldName.single} is not part of the current migration scope.`,
        extra: 'Skipped via migration config.',
      };
    case FieldIncompatibilityReason.SpyOnThatOverwritesField:
      return {
        short: 'A jasmine `spyOn` call spies on this field. This breaks with signals.',
        extra:
          `Migration cannot safely migrate as "spyOn" writes to the ${fieldName.single}. ` +
          `Signal ${fieldName.plural} are readonly.`,
      };
    case FieldIncompatibilityReason.TypeConflictWithBaseClass:
      return {
        short:
          `This ${fieldName.single} overrides a field from a superclass, while the superclass ` +
          `field is not migrated.`,
        extra: 'Migrating the field would break your build because of a type conflict.',
      };
    case FieldIncompatibilityReason.WriteAssignment:
      return {
        short: `Your application code writes to the ${fieldName.single}. This prevents migration.`,
        extra: `Signal ${fieldName.plural} are readonly, so migrating would break your build.`,
      };
    case FieldIncompatibilityReason.OutsideOfMigrationScope:
      return {
        short: `This ${fieldName.single} is not part of any source files in your project.`,
        extra: `The migration excludes ${fieldName.plural} if no source file declaring them was seen.`,
      };
  }
}

/**
 * Gets human-readable message information for the given class incompatibility.
 * This text will be used by the language service, or CLI-based migration.
 */
export function getMessageForClassIncompatibility(
  reason: ClassIncompatibilityReason,
  fieldName: {single: string; plural: string},
): {
  short: string;
  extra: string;
} {
  switch (reason) {
    case ClassIncompatibilityReason.OwningClassReferencedInClassProperty:
      return {
        short: `Class of this ${fieldName.single} is referenced in the signature of another class.`,
        extra:
          'The other class is likely typed to expect a non-migrated field, so ' +
          'migration is skipped to not break your build.',
      };
    case ClassIncompatibilityReason.ClassManuallyInstantiated:
      return {
        short:
          `Class of this ${fieldName.single} is manually instantiated. ` +
          'This is discouraged and prevents migration.',
        extra:
          `Signal ${fieldName.plural} require a DI injection context. Manually instantiating ` +
          'breaks this requirement in some cases, so the migration is skipped.',
      };
  }
}
