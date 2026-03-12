/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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

/**
 * Interface describing a recognized class field that can be
 * uniquely identified throughout the whole migration project
 * (not necessarily just within an isolated compilation unit)
 */
export interface ClassFieldDescriptor {
  node: ts.ClassElement;
  key: ClassFieldUniqueKey;
}

/**
 * Registry of known fields that are considered when inspecting
 * references throughout the project.
 */
export interface KnownFields<D extends ClassFieldDescriptor> {
  /**
   * Attempt to retrieve a known field descriptor for the given symbol.
   *
   * May be null if this is an irrelevant field.
   */
  attemptRetrieveDescriptorFromSymbol(symbol: ts.Symbol): D | null;

  /**
   * Whether the given class should also be respected for reference resolution.
   *
   * E.g. commonly may be implemented to check whether the given contains any
   * known fields. E.g. a reference to the class may be tracked when fields inside
   * are migrated to signal inputs and the public class signature therefore changed.
   */
  shouldTrackClassReference(clazz: ts.ClassDeclaration): boolean;
}
