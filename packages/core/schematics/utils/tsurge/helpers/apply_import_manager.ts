/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/src/ngtsc/translator';
import {
  absoluteFrom,
  absoluteFromSourceFile,
  AbsoluteFsPath,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {projectRelativePath, Replacement, TextUpdate} from '../replacement';

/**
 * Applies import manager changes, and writes them as replacements the
 * given result array.
 */
export function applyImportManagerChanges(
  importManager: ImportManager,
  replacements: Replacement[],
  sourceFiles: readonly ts.SourceFile[],
  projectAbsPath: AbsoluteFsPath,
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
          projectRelativePath(fileName, projectAbsPath),
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
        projectRelativePath(oldBindings.getSourceFile(), projectAbsPath),
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
        projectRelativePath(removedImport.getSourceFile(), projectAbsPath),
        new TextUpdate({
          position: removedImport.getStart(),
          end: removedImport.getEnd(),
          toInsert: '',
        }),
      ),
    );
  }
}
