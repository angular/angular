/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ProgramInfo} from '../../utils/tsurge';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {getClassFieldDescriptorForSymbol} from './field_tracking';
import type {CompilationUnitData} from './migration';

export class KnownQueries implements KnownFields<ClassFieldDescriptor> {
  private readonly classToQueryFields = new WeakMap<
    ts.ClassLikeDeclaration,
    ClassFieldUniqueKey[]
  >();
  private readonly knownQueryIDs = new Set<ClassFieldUniqueKey>();

  fieldNamesToConsiderForReferenceLookup: Set<string>;

  constructor(
    private readonly info: ProgramInfo,
    globalMetadata: CompilationUnitData,
  ) {
    this.fieldNamesToConsiderForReferenceLookup = new Set(
      Object.values(globalMetadata.knownQueryFields).map((f) => f.fieldName),
    );
  }

  registerQueryField(queryField: ts.PropertyDeclaration, id: ClassFieldUniqueKey) {
    if (!this.classToQueryFields.has(queryField.parent)) {
      this.classToQueryFields.set(queryField.parent, []);
    }
    this.classToQueryFields.get(queryField.parent)!.push(id);
    this.knownQueryIDs.add(id);
  }

  attemptRetrieveDescriptorFromSymbol(symbol: ts.Symbol): ClassFieldDescriptor | null {
    const descriptor = getClassFieldDescriptorForSymbol(symbol, this.info);
    if (descriptor !== null && this.knownQueryIDs.has(descriptor.key)) {
      return descriptor;
    }
    return null;
  }

  shouldTrackReferencesToClass(clazz: ts.ClassDeclaration): boolean {
    return this.classToQueryFields.has(clazz);
  }

  getQueryFieldsOfClass(clazz: ts.ClassDeclaration): ClassFieldUniqueKey[] | undefined {
    return this.classToQueryFields.get(clazz);
  }
}
