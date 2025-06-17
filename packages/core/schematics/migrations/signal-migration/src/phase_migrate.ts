/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnalysisProgramInfo} from './analysis_deps';
import {KnownInputs} from './input_detection/known_inputs';
import {MigrationHost} from './migration_host';
import {pass6__migrateInputDeclarations} from './passes/6_migrate_input_declarations';
import {MigrationResult} from './result';
import {pass10_applyImportManager} from './passes/10_apply_import_manager';
import {ImportManager} from '@angular/compiler-cli';
import {InputDescriptor} from './utils/input_id';
import {ReferenceMigrationHost} from './passes/reference_migration/reference_migration_host';
import {pass5__migrateTypeScriptReferences} from './passes/5_migrate_ts_references';
import {pass7__migrateTemplateReferences} from './passes/7_migrate_template_references';
import {pass8__migrateHostBindings} from './passes/8_migrate_host_bindings';
import {pass9__migrateTypeScriptTypeReferences} from './passes/9_migrate_ts_type_references';

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
  info: AnalysisProgramInfo,
) {
  const {typeChecker, sourceFiles} = info;
  const importManager = new ImportManager({
    // For the purpose of this migration, we always use `input` and don't alias
    // it to e.g. `input_1`.
    generateUniqueIdentifier: () => null,
  });

  const referenceMigrationHost: ReferenceMigrationHost<InputDescriptor> = {
    printer: result.printer,
    replacements: result.replacements,
    shouldMigrateReferencesToField: (inputDescr) =>
      knownInputs.has(inputDescr) && knownInputs.get(inputDescr)!.isIncompatible() === false,
    shouldMigrateReferencesToClass: (clazz) =>
      knownInputs.getDirectiveInfoForClass(clazz) !== undefined &&
      knownInputs.getDirectiveInfoForClass(clazz)!.hasMigratedFields(),
  };

  // Migrate passes.
  pass5__migrateTypeScriptReferences(referenceMigrationHost, result.references, typeChecker, info);
  pass6__migrateInputDeclarations(host, typeChecker, result, knownInputs, importManager, info);
  pass7__migrateTemplateReferences(referenceMigrationHost, result.references);
  pass8__migrateHostBindings(referenceMigrationHost, result.references, info);
  pass9__migrateTypeScriptTypeReferences(
    referenceMigrationHost,
    result.references,
    importManager,
    info,
  );
  pass10_applyImportManager(importManager, result, sourceFiles, info);
}
