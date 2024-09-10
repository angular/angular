/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MigrationResult} from '../result';
import {KnownInputs} from '../input_detection/known_inputs';
import {Replacement, TextUpdate} from '../../../../utils/tsurge';
import {isTemplateReference} from './references/reference_kinds';

/**
 * Phase that migrates Angular template references to
 * unwrap signals.
 */
export function pass7__migrateTemplateReferences(
  result: MigrationResult,
  knownInputs: KnownInputs,
) {
  const seenFileReferences = new Set<string>();

  for (const reference of result.references) {
    // This pass only deals with HTML template references.
    if (!isTemplateReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (knownInputs.get(reference.target)!.isIncompatible()) {
      continue;
    }

    // Skip duplicate references. E.g. if a template is shared.
    const fileReferenceId = `${reference.from.templateFile.id}:${reference.from.read.sourceSpan.end}`;
    if (seenFileReferences.has(fileReferenceId)) {
      continue;
    }
    seenFileReferences.add(fileReferenceId);

    // Expand shorthands like `{bla}` to `{bla: bla()}`.
    const appendText = reference.from.isObjectShorthandExpression
      ? `: ${reference.from.read.name}()`
      : `()`;

    result.replacements.push(
      new Replacement(
        reference.from.templateFile,
        new TextUpdate({
          position: reference.from.read.sourceSpan.end,
          end: reference.from.read.sourceSpan.end,
          toInsert: appendText,
        }),
      ),
    );
  }
}
