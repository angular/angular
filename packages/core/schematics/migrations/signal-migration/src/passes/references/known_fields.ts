/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {UniqueID} from '../../../../../utils/tsurge';

/**
 * Unique key for an class field in a project.
 *
 * This is the serializable variant, raw string form that
 * is serializable and allows for cross-target knowledge
 * needed for the batching capability (via e.g. go/tsunami).
 */
export type ClassFieldUniqueKey = UniqueID<'ClassField Unique ID'>;

export interface ClassFieldDescriptor {
  node: ts.Node;
  key: ClassFieldUniqueKey;
}

export interface KnownFields<D extends ClassFieldDescriptor> {
  // For performance lookups to avoid expensive TS symbol lookups.
  // May be null if all identifiers should be inspected.
  fieldNamesToConsiderForReferenceLookup: Set<string> | null;

  attemptRetrieveDescriptorFromSymbol(symbol: ts.Symbol): D | null;
  isClassContainingKnownFields(clazz: ts.ClassDeclaration): boolean;
}
