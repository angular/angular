/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../../utils/tsurge';
import assert from 'assert';
import {ImportManager} from '@angular/compiler-cli';
import {isTsClassTypeReference, Reference} from '../reference_resolution/reference_kinds';
import {ReferenceMigrationHost} from './reference_migration_host';
import {ClassFieldDescriptor} from '../reference_resolution/known_fields';

/**
 * Migrates TypeScript "ts.Type" references. E.g.

 *  - `Partial<MyComp>` will be converted to `UnwrapSignalInputs<Partial<MyComp>>`.
      in Catalyst test files.
 */
export function migrateTypeScriptTypeReferences<D extends ClassFieldDescriptor>(
  host: ReferenceMigrationHost<D>,
  references: Reference<D>[],
  importManager: ImportManager,
  info: ProgramInfo,
) {
  const seenTypeNodes = new WeakSet<ts.TypeReferenceNode>();

  for (const reference of references) {
    // This pass only deals with TS input class type references.
    if (!isTsClassTypeReference(reference)) {
      continue;
    }
    // Skip references to classes that are not fully migrated.
    if (!host.shouldMigrateReferencesToClass(reference.target)) {
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
      // Naive detection of the import. Sufficient for this test file migration.
      const catalystImport = sf.text.includes(
        'google3/javascript/angular2/testing/catalyst/fake_async',
      )
        ? 'google3/javascript/angular2/testing/catalyst/fake_async'
        : 'google3/javascript/angular2/testing/catalyst/async';

      const unwrapImportExpr = importManager.addImport({
        exportModuleSpecifier: catalystImport,
        exportSymbolName: 'UnwrapSignalInputs',
        requestedFile: sf,
      });

      host.replacements.push(
        new Replacement(
          projectFile(sf, info),
          new TextUpdate({
            position: firstArg.getStart(),
            end: firstArg.getStart(),
            toInsert: `${host.printer.printNode(ts.EmitHint.Unspecified, unwrapImportExpr, sf)}<`,
          }),
        ),
      );
      host.replacements.push(
        new Replacement(
          projectFile(sf, info),
          new TextUpdate({position: firstArg.getEnd(), end: firstArg.getEnd(), toInsert: '>'}),
        ),
      );
    }
  }
}
