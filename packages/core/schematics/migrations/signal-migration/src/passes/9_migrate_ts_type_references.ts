/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationResult} from '../result';
import {isTsInputClassTypeReference} from '../utils/input_reference';
import {Replacement} from '../replacement';
import assert from 'assert';
import {ImportManager} from '../../../../../../compiler-cli/src/ngtsc/translator';

/**
 * Migrates TypeScript "ts.Type" references. E.g.

 *  - `Partial<MyComp>` will be converted to `UnwrapSignalInputs<Partial<MyComp>>`.
      in Catalyst test files.
 */
export function pass9__migrateTypeScriptTypeReferences(
  result: MigrationResult,
  knownInputs: KnownInputs,
) {
  const seenTypeNodes = new WeakSet<ts.TypeReferenceNode>();
  const fileNamesToFiles = new Map<string, ts.SourceFile>();
  const importManager = new ImportManager();

  for (const reference of result.references) {
    // This pass only deals with TS input class type references.
    if (!isTsInputClassTypeReference(reference)) {
      continue;
    }
    // Skip references to classes that are not migrated.
    if (knownInputs.getDirectiveInfoForClass(reference.target)!.isClassSkippedForMigration()) {
      continue;
    }
    // Skip duplicate references. E.g. in batching.
    if (seenTypeNodes.has(reference.from.node)) {
      continue;
    }
    seenTypeNodes.add(reference.from.node);

    if (reference.isPartialReference && reference.isPartOfCatalystFile) {
      assert(reference.from.node.typeArguments, 'Expected type arguments for partial reference.');
      assert(reference.from.node.typeArguments.length === 1, 'Expected an argument for reference.');

      const firstArg = reference.from.node.typeArguments[0];
      const sf = firstArg.getSourceFile();

      fileNamesToFiles.set(sf.fileName, sf);
      const unwrapImportExpr = importManager.addImport({
        exportModuleSpecifier: 'google3/javascript/angular2/testing/catalyst',
        exportSymbolName: 'UnwrapSignalInputs',
        requestedFile: sf,
      });

      result.addReplacement(
        sf.fileName,
        new Replacement(
          firstArg.getStart(),
          firstArg.getStart(),
          `${ts.createPrinter().printNode(ts.EmitHint.Unspecified, unwrapImportExpr, sf)}<`,
        ),
      );
      result.addReplacement(
        sf.fileName,
        new Replacement(firstArg.getEnd(), firstArg.getEnd(), '>'),
      );
    }

    // TODO: Formalize import manager support across phases.
    const {newImports, updatedImports} = importManager.finalize();

    // Capture new imports
    newImports.forEach((newImports, fileName) => {
      newImports.forEach((newImport) => {
        result.addReplacement(
          fileName,
          new Replacement(
            0,
            0,
            ts
              .createPrinter()
              .printNode(ts.EmitHint.Unspecified, newImport, fileNamesToFiles.get(fileName)!) +
              '\n',
          ),
        );
      });
    });

    // Capture updated imports
    for (const [oldBindings, newBindings] of updatedImports.entries()) {
      result.addReplacement(
        oldBindings.getSourceFile().fileName,
        new Replacement(
          oldBindings.getStart(),
          oldBindings.getEnd(),
          ts
            .createPrinter()
            .printNode(ts.EmitHint.Unspecified, newBindings, oldBindings.getSourceFile()),
        ),
      );
    }
  }
}
