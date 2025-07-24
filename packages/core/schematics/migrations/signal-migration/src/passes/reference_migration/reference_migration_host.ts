/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {Replacement} from '../../../../../utils/tsurge';
import {ClassFieldDescriptor} from '../reference_resolution/known_fields';

export interface ReferenceMigrationHost<D extends ClassFieldDescriptor> {
  shouldMigrateReferencesToField: (descriptor: D) => boolean;
  shouldMigrateReferencesToClass: (clazz: ts.ClassDeclaration) => boolean;
  replacements: Replacement[];
  printer: ts.Printer;
}
