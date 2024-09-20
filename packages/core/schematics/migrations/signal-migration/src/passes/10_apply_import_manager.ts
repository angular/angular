/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ImportManager} from '../../../../../../compiler-cli/src/ngtsc/translator';
import {applyImportManagerChanges} from '../../../../utils/tsurge/helpers/apply_import_manager';
import {MigrationResult} from '../result';

/**
 * Phase that applies all changes recorded by the import manager in
 * previous migrate phases.
 */
export function pass10_applyImportManager(
  importManager: ImportManager,
  result: MigrationResult,
  sourceFiles: readonly ts.SourceFile[],
) {
  applyImportManagerChanges(importManager, result.replacements, sourceFiles);
}
