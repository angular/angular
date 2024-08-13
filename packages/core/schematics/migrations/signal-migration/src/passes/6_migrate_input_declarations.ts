/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {MigrationResult} from '../result';
import {Replacement} from '../replacement';
import {convertToSignalInput} from '../convert-input/convert_to_signal';
import assert from 'assert';
import {KnownInputs} from '../input_detection/known_inputs';
import {ImportManager} from '../../../../../../compiler-cli/src/ngtsc/translator';

/**
 * Phase that migrates `@Input()` declarations to signal inputs and
 * manages imports within the given file.
 */
export function pass6__migrateInputDeclarations(
  checker: ts.TypeChecker,
  result: MigrationResult,
  knownInputs: KnownInputs,
  importManager: ImportManager,
) {
  let filesWithMigratedInputs = new Set<ts.SourceFile>();
  let filesWithIncompatibleInputs = new WeakSet<ts.SourceFile>();

  for (const [input, metadata] of result.sourceInputs) {
    const sf = input.node.getSourceFile();

    // Do not migrate incompatible inputs.
    if (knownInputs.get(input)!.isIncompatible() || metadata === null) {
      filesWithIncompatibleInputs.add(sf);
      continue;
    }

    assert(!ts.isAccessor(input.node), 'Accessor inputs are incompatible.');

    filesWithMigratedInputs.add(sf);
    result.addReplacement(
      sf.fileName,
      new Replacement(
        input.node.getStart(),
        input.node.getEnd(),
        convertToSignalInput(input.node, metadata, checker, importManager),
      ),
    );
  }

  for (const file of filesWithMigratedInputs) {
    // All inputs were migrated, so we can safely remove the `Input` symbol.
    if (!filesWithIncompatibleInputs.has(file)) {
      importManager.removeImport(file, 'Input', '@angular/core');
    }
  }
}
