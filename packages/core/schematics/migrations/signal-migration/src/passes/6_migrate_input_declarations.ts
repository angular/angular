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
import {MigrationHost} from '../migration_host';
import {KnownInputs} from '../input_detection/known_inputs';

/**
 * Phase that migrates `@Input()` declarations to signal inputs and
 * manages imports within the given file.
 */
export function pass6__migrateInputDeclarations(
  host: MigrationHost,
  checker: ts.TypeChecker,
  result: MigrationResult,
  knownInputs: KnownInputs,
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
        convertToSignalInput(host, input.node, metadata, checker),
      ),
    );
  }

  // TODO: Consider using import manager for conflicts. but also in `convert_to_signal` then.

  for (const file of filesWithMigratedInputs) {
    const specifiers = result.inputDecoratorSpecifiers.get(file);
    assert(specifiers !== undefined, `No imports in source file of input: ${file.fileName}`);

    const decoratorInputSpecifier = specifiers.find((s) => s.kind === 'decorator-input-import');
    assert(decoratorInputSpecifier, 'Expected at least one import to "Input"');

    const signalInputSpecifier = specifiers.find((s) => s.kind === 'signal-input-import');

    if (filesWithIncompatibleInputs.has(file)) {
      // add `input`, but not remove `Input`. Both are needed still.
      if (signalInputSpecifier === undefined) {
        result.addReplacement(
          file.fileName,
          new Replacement(
            decoratorInputSpecifier.node.getEnd(),
            decoratorInputSpecifier.node.getEnd(),
            ', input',
          ),
        );
      }
    } else {
      // replace `Input` with `input`. All migrated in this file.
      if (signalInputSpecifier === undefined) {
        result.addReplacement(
          file.fileName,
          new Replacement(
            decoratorInputSpecifier.node.getStart(),
            decoratorInputSpecifier.node.getEnd(),
            'input',
          ),
        );
      } else {
        const elements = decoratorInputSpecifier.node.parent.elements;
        const indexOfSpecifier = elements.findIndex((c) => c === decoratorInputSpecifier.node);

        let start = decoratorInputSpecifier.node.getStart();
        let end = decoratorInputSpecifier.node.getEnd();

        // Either collapse (the comman between specifiers) with the preceding element,
        // or with the following if present.
        if (indexOfSpecifier > 0) {
          start = elements[indexOfSpecifier - 1].getEnd();
        } else {
          if (elements.length > indexOfSpecifier + 1) {
            end = elements[indexOfSpecifier + 1].getStart();
          }
        }

        // We already have `input` in source code. Remove `Input` completely.
        result.addReplacement(file.fileName, new Replacement(start, end, ''));
      }
    }
  }
}
