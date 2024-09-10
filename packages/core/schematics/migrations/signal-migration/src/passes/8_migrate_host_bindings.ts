/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../utils/tsurge';
import {MigrationResult} from '../result';
import {KnownInputs} from '../input_detection/known_inputs';
import {isHostBindingReference} from './references/reference_kinds';

/**
 * Phase that migrates Angular host binding references to
 * unwrap signals.
 */
export function pass8__migrateHostBindings(
  result: MigrationResult,
  knownInputs: KnownInputs,
  info: ProgramInfo,
) {
  const seenReferences = new WeakMap<ts.Node, Set<number>>();

  for (const reference of result.references) {
    // This pass only deals with host binding references.
    if (!isHostBindingReference(reference)) {
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
        projectFile(bindingField.getSourceFile(), info),
        new TextUpdate({position: readEndPos, end: readEndPos, toInsert: appendText}),
      ),
    );
  }
}
