/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ProgramInfo} from '../../utils/tsurge';
import {ProblematicFieldRegistry} from '../signal-migration/src/passes/problematic_patterns/problematic_field_registry';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {getClassFieldDescriptorForSymbol} from './field_tracking';
import type {CompilationUnitData} from './migration';

export class KnownQueries
  implements KnownFields<ClassFieldDescriptor>, ProblematicFieldRegistry<ClassFieldDescriptor>
{
  private readonly classToQueryFields = new Map<ts.ClassLikeDeclaration, ClassFieldDescriptor[]>();
  private readonly knownQueryIDs = new Set<ClassFieldUniqueKey>();

  fieldNamesToConsiderForReferenceLookup: Set<string>;

  constructor(
    private readonly info: ProgramInfo,
    private globalMetadata: CompilationUnitData,
  ) {
    this.fieldNamesToConsiderForReferenceLookup = new Set(
      Object.values(globalMetadata.knownQueryFields).map((f) => f.fieldName),
    );
  }

  isFieldIncompatible(descriptor: ClassFieldDescriptor): boolean {
    return this.globalMetadata.problematicQueries[descriptor.key] !== undefined;
  }

  markFieldIncompatible(field: ClassFieldDescriptor): void {
    this.globalMetadata.problematicQueries[field.key] = true;
  }

  markClassIncompatible(node: ts.ClassDeclaration): void {
    this.classToQueryFields.get(node)?.forEach((f) => {
      this.globalMetadata.problematicQueries[f.key] = true;
    });
  }

  registerQueryField(queryField: ts.PropertyDeclaration, id: ClassFieldUniqueKey) {
    if (!this.classToQueryFields.has(queryField.parent)) {
      this.classToQueryFields.set(queryField.parent, []);
    }

    this.classToQueryFields.get(queryField.parent)!.push({
      key: id,
      node: queryField,
    });
    this.knownQueryIDs.add(id);
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
}
