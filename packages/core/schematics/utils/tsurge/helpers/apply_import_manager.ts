/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, ImportManager} from '@angular/compiler-cli';
import ts from 'typescript';
import {ProgramInfo} from '../program_info';
import {projectFile} from '../project_paths';
import {Replacement, TextUpdate} from '../replacement';

/**
 * Applies import manager changes, and writes them as replacements the
 * given result array.
 */
export function applyImportManagerChanges(
  importManager: ImportManager,
  replacements: Replacement[],
  sourceFiles: readonly ts.SourceFile[],
  info: Pick<ProgramInfo, 'sortedRootDirs' | 'projectRoot'>,
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
          projectFile(absoluteFrom(fileName), info),
          new TextUpdate({position: 0, end: 0, toInsert: `${printedImport}\n`}),
        ),
      );
    });
  });

  // Capture updated imports
  for (const [oldBindings, newBindings] of updatedImports.entries()) {
    // The import will be generated as multi-line if it already is multi-line,
    // or if the number of elements significantly increased and it previously
    // consisted of very few specifiers.
    const isMultiline =
      oldBindings.getText().includes('\n') ||
      (newBindings.elements.length >= 6 && oldBindings.elements.length <= 3);
    const hasSpaceBetweenBraces = oldBindings.getText().startsWith('{ ');

    let formatFlags =
      ts.ListFormat.NamedImportsOrExportsElements |
      ts.ListFormat.Indented |
      ts.ListFormat.Braces |
      ts.ListFormat.PreserveLines |
      (isMultiline ? ts.ListFormat.MultiLine : ts.ListFormat.SingleLine);

    if (hasSpaceBetweenBraces) {
      formatFlags |= ts.ListFormat.SpaceBetweenBraces;
    } else {
      formatFlags &= ~ts.ListFormat.SpaceBetweenBraces;
    }

    const printedBindings = printer.printList(
      formatFlags,
      newBindings.elements,
      oldBindings.getSourceFile(),
    );
    replacements.push(
      new Replacement(
        projectFile(oldBindings.getSourceFile(), info),
        new TextUpdate({
          position: oldBindings.getStart(),
          end: oldBindings.getEnd(),
          // TS uses four spaces as indent. We migrate to two spaces as we
          // assume this to be more common.
          toInsert: printedBindings.replace(/^ {4}/gm, '  '),
        }),
      ),
    );
  }

  // Update removed imports
  for (const removedImport of deletedImports) {
    replacements.push(
      new Replacement(
        projectFile(removedImport.getSourceFile(), info),
        new TextUpdate({
          position: removedImport.getStart(),
          end: removedImport.getEnd(),
          toInsert: '',
        }),
      ),
    );
  }
}
