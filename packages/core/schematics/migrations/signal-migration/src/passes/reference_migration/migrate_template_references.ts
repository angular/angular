/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Replacement, TextUpdate} from '../../../../../utils/tsurge';
import {ClassFieldDescriptor} from '../reference_resolution/known_fields';
import {isTemplateReference, Reference} from '../reference_resolution/reference_kinds';
import {ReferenceMigrationHost} from './reference_migration_host';

/**
 * Phase that migrates Angular template references to
 * unwrap signals.
 */
export function migrateTemplateReferences<D extends ClassFieldDescriptor>(
  host: ReferenceMigrationHost<D>,
  references: Reference<D>[],
) {
  const seenFileReferences = new Set<string>();

  for (const reference of references) {
    // This pass only deals with HTML template references.
    if (!isTemplateReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (!host.shouldMigrateReferencesToField(reference.target)) {
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

    host.replacements.push(
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
