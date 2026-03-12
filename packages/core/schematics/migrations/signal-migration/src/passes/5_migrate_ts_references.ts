/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {migrateTypeScriptReferences} from './reference_migration/migrate_ts_references';
import {ProgramInfo} from '../../../../utils/tsurge';
import {Reference} from './reference_resolution/reference_kinds';
import {ClassFieldDescriptor} from './reference_resolution/known_fields';
import {ReferenceMigrationHost} from './reference_migration/reference_migration_host';

/**
 * Phase that migrates TypeScript input references to be signal compatible.
 *
 * The phase takes care of control flow analysis and generates temporary variables
 * where needed to ensure narrowing continues to work. E.g.
 */
export function pass5__migrateTypeScriptReferences<D extends ClassFieldDescriptor>(
  host: ReferenceMigrationHost<D>,
  references: Reference<D>[],
  checker: ts.TypeChecker,
  info: ProgramInfo,
) {
  migrateTypeScriptReferences(host, references, checker, info);
}
