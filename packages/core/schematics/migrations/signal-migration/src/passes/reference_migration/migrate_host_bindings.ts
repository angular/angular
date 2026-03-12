/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../../utils/tsurge';
import {ClassFieldDescriptor} from '../reference_resolution/known_fields';
import {isHostBindingReference, Reference} from '../reference_resolution/reference_kinds';
import {ReferenceMigrationHost} from './reference_migration_host';

/**
 * Phase that migrates Angular host binding references to
 * unwrap signals.
 */
export function migrateHostBindings<D extends ClassFieldDescriptor>(
  host: ReferenceMigrationHost<D>,
  references: Reference<D>[],
  info: ProgramInfo,
) {
  const seenReferences = new WeakMap<ts.Node, Set<number>>();

  for (const reference of references) {
    // This pass only deals with host binding references.
    if (!isHostBindingReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (!host.shouldMigrateReferencesToField(reference.target)) {
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

    host.replacements.push(
      new Replacement(
        projectFile(bindingField.getSourceFile(), info),
        new TextUpdate({position: readEndPos, end: readEndPos, toInsert: appendText}),
      ),
    );
  }
}
