/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../utils/tsurge';
import {ProblematicFieldRegistry} from '../signal-migration/src/passes/problematic_patterns/problematic_field_registry';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {getClassFieldDescriptorForSymbol} from './field_tracking';
import type {GlobalUnitData} from './migration';
import {InheritanceTracker} from '../signal-migration/src/passes/problematic_patterns/check_inheritance';
import {
  FieldIncompatibility,
  getMessageForClassIncompatibility,
  getMessageForFieldIncompatibility,
} from '../signal-migration/src';
import {
  ClassIncompatibilityReason,
  FieldIncompatibilityReason,
} from '../signal-migration/src/passes/problematic_patterns/incompatibility';
import {markFieldIncompatibleInMetadata} from './incompatibility';
import {ExtractedQuery} from './identify_queries';
import {MigrationConfig} from './migration_config';

export class KnownQueries
  implements
    KnownFields<ClassFieldDescriptor>,
    ProblematicFieldRegistry<ClassFieldDescriptor>,
    InheritanceTracker<ClassFieldDescriptor>
{
  private readonly classToQueryFields = new Map<ts.ClassLikeDeclaration, ClassFieldDescriptor[]>();

  readonly knownQueryIDs = new Map<ClassFieldUniqueKey, ClassFieldDescriptor>();

  constructor(
    private readonly info: ProgramInfo,
    private readonly config: MigrationConfig,
    public globalMetadata: GlobalUnitData,
  ) {}

  isFieldIncompatible(descriptor: ClassFieldDescriptor): boolean {
    return this.getIncompatibilityForField(descriptor) !== null;
  }

  markFieldIncompatible(field: ClassFieldDescriptor, incompatibility: FieldIncompatibility): void {
    markFieldIncompatibleInMetadata(
      this.globalMetadata.problematicQueries,
      field.key,
      incompatibility.reason,
    );
  }

  markClassIncompatible(node: ts.ClassDeclaration, reason: ClassIncompatibilityReason): void {
    this.classToQueryFields.get(node)?.forEach((f) => {
      this.globalMetadata.problematicQueries[f.key] ??= {classReason: null, fieldReason: null};
      this.globalMetadata.problematicQueries[f.key].classReason = reason;
    });
  }

  registerQueryField(queryField: ExtractedQuery['node'], id: ClassFieldUniqueKey) {
    if (!this.classToQueryFields.has(queryField.parent)) {
      this.classToQueryFields.set(queryField.parent, []);
    }

    this.classToQueryFields.get(queryField.parent)!.push({
      key: id,
      node: queryField,
    });
    this.knownQueryIDs.set(id, {key: id, node: queryField});

    const descriptor: ClassFieldDescriptor = {key: id, node: queryField};
    const file = projectFile(queryField.getSourceFile(), this.info);

    if (
      this.config.shouldMigrateQuery !== undefined &&
      !this.config.shouldMigrateQuery(descriptor, file)
    ) {
      this.markFieldIncompatible(descriptor, {
        context: null,
        reason: FieldIncompatibilityReason.SkippedViaConfigFilter,
      });
    }
  }

  attemptRetrieveDescriptorFromSymbol(symbol: ts.Symbol): ClassFieldDescriptor | null {
    const descriptor = getClassFieldDescriptorForSymbol(symbol, this.info);
    if (descriptor !== null && this.knownQueryIDs.has(descriptor.key)) {
      return descriptor;
    }
    return null;
  }

  shouldTrackClassReference(clazz: ts.ClassDeclaration): boolean {
    return this.classToQueryFields.has(clazz);
  }

  getQueryFieldsOfClass(clazz: ts.ClassDeclaration): ClassFieldDescriptor[] | undefined {
    return this.classToQueryFields.get(clazz);
  }

  getAllClassesWithQueries(): ts.ClassDeclaration[] {
    return Array.from(this.classToQueryFields.keys()).filter((c) => ts.isClassDeclaration(c));
  }

  captureKnownFieldInheritanceRelationship(
    derived: ClassFieldDescriptor,
    parent: ClassFieldDescriptor,
  ): void {
    // Note: The edge problematic pattern recognition is not as good as the one
    // we have in the signal input migration. That is because we couldn't trivially
    // build up an inheritance graph during analyze phase where we DON'T know what
    // fields refer to queries. Usually we'd use the graph to smartly propagate
    // incompatibilities using topological sort. This doesn't work here and is
    // unnecessarily complex, so we try our best at detecting direct edge
    // incompatibilities (which are quite order dependent).

    if (this.isFieldIncompatible(parent) && !this.isFieldIncompatible(derived)) {
      this.markFieldIncompatible(derived, {
        context: null,
        reason: FieldIncompatibilityReason.ParentIsIncompatible,
      });
      return;
    }

    if (this.isFieldIncompatible(derived) && !this.isFieldIncompatible(parent)) {
      this.markFieldIncompatible(parent, {
        context: null,
        reason: FieldIncompatibilityReason.DerivedIsIncompatible,
      });
    }
  }

  captureUnknownDerivedField(field: ClassFieldDescriptor): void {
    this.markFieldIncompatible(field, {
      context: null,
      reason: FieldIncompatibilityReason.OverriddenByDerivedClass,
    });
  }

  captureUnknownParentField(field: ClassFieldDescriptor): void {
    this.markFieldIncompatible(field, {
      context: null,
      reason: FieldIncompatibilityReason.TypeConflictWithBaseClass,
    });
  }

  getIncompatibilityForField(
    descriptor: ClassFieldDescriptor,
  ): FieldIncompatibility | ClassIncompatibilityReason | null {
    const problematicInfo = this.globalMetadata.problematicQueries[descriptor.key];
    if (problematicInfo === undefined) {
      return null;
    }
    if (problematicInfo.fieldReason !== null) {
      return {context: null, reason: problematicInfo.fieldReason};
    }
    if (problematicInfo.classReason !== null) {
      return problematicInfo.classReason;
    }
    return null;
  }

  getIncompatibilityTextForField(
    field: ClassFieldDescriptor,
  ): {short: string; extra: string} | null {
    const incompatibilityInfo = this.globalMetadata.problematicQueries[field.key];
    if (incompatibilityInfo.fieldReason !== null) {
      return getMessageForFieldIncompatibility(incompatibilityInfo.fieldReason, {
        single: 'query',
        plural: 'queries',
      });
    }
    if (incompatibilityInfo.classReason !== null) {
      return getMessageForClassIncompatibility(incompatibilityInfo.classReason, {
        single: 'query',
        plural: 'queries',
      });
    }
    return null;
  }
}
