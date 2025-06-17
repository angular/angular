/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli';
import {ProgramInfo} from '../../../../utils/tsurge';
import {migrateTypeScriptTypeReferences} from './reference_migration/migrate_ts_type_references';
import {ReferenceMigrationHost} from './reference_migration/reference_migration_host';
import {ClassFieldDescriptor} from './reference_resolution/known_fields';
import {Reference} from './reference_resolution/reference_kinds';

/**
 * Migrates TypeScript "ts.Type" references. E.g.

 *  - `Partial<MyComp>` will be converted to `UnwrapSignalInputs<Partial<MyComp>>`.
      in Catalyst test files.
 */
export function pass9__migrateTypeScriptTypeReferences<D extends ClassFieldDescriptor>(
  host: ReferenceMigrationHost<D>,
  references: Reference<D>[],
  importManager: ImportManager,
  info: ProgramInfo,
) {
  migrateTypeScriptTypeReferences(host, references, importManager, info);
}
