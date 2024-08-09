/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ImportManager} from '../../../../../../compiler-cli/src/ngtsc/translator';
import {Replacement} from '../replacement';
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
  const {newImports, updatedImports, deletedImports} = importManager.finalize();
  const printer = ts.createPrinter({});
  const pathToFile = new Map<string, ts.SourceFile>(sourceFiles.map((s) => [s.fileName, s]));

  // Capture new imports
  newImports.forEach((newImports, fileName) => {
    newImports.forEach((newImport) => {
      const printedImport = printer.printNode(
        ts.EmitHint.Unspecified,
        newImport,
        pathToFile.get(fileName)!,
      );
      result.addReplacement(fileName, new Replacement(0, 0, `${printedImport}\n`));
    });
  });

  // Capture updated imports
  for (const [oldBindings, newBindings] of updatedImports.entries()) {
    const printedBindings = printer.printNode(
      ts.EmitHint.Unspecified,
      newBindings,
      oldBindings.getSourceFile(),
    );
    result.addReplacement(
      oldBindings.getSourceFile().fileName,
      new Replacement(oldBindings.getStart(), oldBindings.getEnd(), printedBindings),
    );
  }

  // Update removed imports
  for (const removedImport of deletedImports) {
    result.addReplacement(
      removedImport.getSourceFile().fileName,
      new Replacement(removedImport.getStart(), removedImport.getEnd(), ''),
    );
  }
}
