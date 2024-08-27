/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ImportManager} from '../../../../../compiler-cli/src/ngtsc/translator';
import {
  absoluteFrom,
  absoluteFromSourceFile,
} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {Replacement, TextUpdate} from '../replacement';

/**
 * Applies import manager changes, and writes them as replacements the
 * given result array.
 */
export function applyImportManagerChanges(
  importManager: ImportManager,
  replacements: Replacement[],
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
      replacements.push(
        new Replacement(
          absoluteFrom(fileName),
          new TextUpdate({position: 0, end: 0, toInsert: `${printedImport}\n`}),
        ),
      );
    });
  });

  // Capture updated imports
  for (const [oldBindings, newBindings] of updatedImports.entries()) {
    const printedBindings = printer.printNode(
      ts.EmitHint.Unspecified,
      newBindings,
      oldBindings.getSourceFile(),
    );
    replacements.push(
      new Replacement(
        absoluteFromSourceFile(oldBindings.getSourceFile()),
        new TextUpdate({
          position: oldBindings.getStart(),
          end: oldBindings.getEnd(),
          toInsert: printedBindings,
        }),
      ),
    );
  }

  // Update removed imports
  for (const removedImport of deletedImports) {
    replacements.push(
      new Replacement(
        absoluteFromSourceFile(removedImport.getSourceFile()),
        new TextUpdate({
          position: removedImport.getStart(),
          end: removedImport.getEnd(),
          toInsert: '',
        }),
      ),
    );
  }
}
