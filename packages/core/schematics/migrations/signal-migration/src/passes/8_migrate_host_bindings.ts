/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {projectRelativePath, Replacement, TextUpdate} from '../../../../utils/tsurge/replacement';
import {MigrationResult} from '../result';
import {isHostBindingInputReference} from '../utils/input_reference';
import {KnownInputs} from '../input_detection/known_inputs';

/**
 * Phase that migrates Angular host binding references to
 * unwrap signals.
 */
export function pass8__migrateHostBindings(
  result: MigrationResult,
  knownInputs: KnownInputs,
  projectDirAbsPath: AbsoluteFsPath,
) {
  const seenReferences = new WeakMap<ts.Node, Set<number>>();

  for (const reference of result.references) {
    // This pass only deals with host binding references.
    if (!isHostBindingInputReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (knownInputs.get(reference.target)!.isIncompatible()) {
      continue;
    }

    const bindingField = reference.from.hostPropertyNode;
    const expressionOffset = bindingField.getStart() + 1; // account for quotes.
    const readEndPos = expressionOffset + reference.from.read.sourceSpan.end;

    // Skip duplicate references. Can happen if the host object is shared.
    if (seenReferences.get(bindingField)?.has(readEndPos)) {
      continue;
    }
    if (seenReferences.has(bindingField)) {
      seenReferences.get(bindingField)!.add(readEndPos);
    } else {
      seenReferences.set(bindingField, new Set([readEndPos]));
    }

    // Expand shorthands like `{bla}` to `{bla: bla()}`.
    const appendText = reference.from.isObjectShorthandExpression
      ? `: ${reference.from.read.name}()`
      : `()`;

    result.replacements.push(
      new Replacement(
        projectRelativePath(bindingField.getSourceFile(), projectDirAbsPath),
        new TextUpdate({position: readEndPos, end: readEndPos, toInsert: appendText}),
      ),
    );
  }
}
