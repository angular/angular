/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnalysisProgramInfo} from './create_program';
import {KnownInputs} from './input_detection/known_inputs';
import {MigrationHost} from './migration_host';
import {pass5__migrateTypeScriptReferences} from './passes/5_migrate_ts_references';
import {pass6__migrateInputDeclarations} from './passes/6_migrate_input_declarations';
import {pass7__migrateTemplateReferences} from './passes/7_migrate_template_references';
import {pass8__migrateHostBindings} from './passes/8_migrate_host_bindings';
import {pass9__migrateTypeScriptTypeReferences} from './passes/9_migrate_ts_type_references';
import {MigrationResult} from './result';

/**
 * Executes the migration phase.
 *
 * This involves:
 *   - migrating TS references.
 *   - migrating `@Input()` declarations.
 *   - migrating template references.
 *   - migrating host binding references.
 */
export function executeMigrationPhase(
  host: MigrationHost,
  knownInputs: KnownInputs,
  result: MigrationResult,
  {typeChecker}: AnalysisProgramInfo,
) {
  // Migrate passes.
  pass5__migrateTypeScriptReferences(result, typeChecker, knownInputs);
  pass6__migrateInputDeclarations(host, typeChecker, result, knownInputs);
  pass7__migrateTemplateReferences(host, result, knownInputs);
  pass8__migrateHostBindings(result, knownInputs);
  pass9__migrateTypeScriptTypeReferences(result, knownInputs);
}
