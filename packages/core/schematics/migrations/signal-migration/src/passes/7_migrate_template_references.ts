/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MigrationHost} from '../migration_host';
import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MigrationResult} from '../result';
import {isTemplateInputReference} from '../utils/input_reference';
import {KnownInputs} from '../input_detection/known_inputs';
import {projectRelativePath, Replacement, TextUpdate} from '../../../../utils/tsurge/replacement';

/**
 * Phase that migrates Angular template references to
 * unwrap signals.
 */
export function pass7__migrateTemplateReferences(
  host: MigrationHost,
  result: MigrationResult,
  knownInputs: KnownInputs,
  projectDirAbsPath: AbsoluteFsPath,
) {
  const seenFileReferences = new Set<string>();

  for (const reference of result.references) {
    // This pass only deals with HTML template references.
    if (!isTemplateInputReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (knownInputs.get(reference.target)!.isIncompatible()) {
      continue;
    }

    // Skip duplicate references. E.g. if a template is shared.
    const fileReferenceId = `${reference.from.templateFileId}:${reference.from.read.sourceSpan.end}`;
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
        projectRelativePath(host.idToFilePath(reference.from.templateFileId), projectDirAbsPath),
        new TextUpdate({
          position: reference.from.read.sourceSpan.end,
          end: reference.from.read.sourceSpan.end,
          toInsert: appendText,
        }),
      ),
    );
  }
}
