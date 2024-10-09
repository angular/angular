/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ClassFieldDescriptor} from '../reference_resolution/known_fields';
import {ClassIncompatibilityReason, FieldIncompatibility} from './incompatibility';

/**
 * Interface describing a registry for identifying and checking
 * of problematic fields that cannot be migrated due to given
 * incompatibility reasons.
 *
 * This is useful for sharing the input incompatibility logic for e.g.
 * inheritance or common patterns across migrations, like with the queries
 * migration.
 *
 * Notably, the incompatibility reasons at this point are still tied to the
 * "input" name. This is acceptable to simplify the mental complexity of parsing
 * all related code.
 */
export interface ProblematicFieldRegistry<D extends ClassFieldDescriptor> {
  isFieldIncompatible(descriptor: D): boolean;
  markFieldIncompatible(field: D, info: FieldIncompatibility): void;
  markClassIncompatible(node: ts.ClassDeclaration, reason: ClassIncompatibilityReason): void;
}
