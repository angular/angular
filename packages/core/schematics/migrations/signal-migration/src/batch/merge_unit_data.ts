/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Reference,
  ReferenceKind,
  TsReference,
} from '../passes/reference_resolution/reference_kinds';
import {InputDescriptor} from '../utils/input_id';
import {CompilationUnitData, SerializableForBatching} from './unit_data';

/** Merges a list of compilation units into a combined unit. */
export function mergeCompilationUnitData(
  metadataFiles: CompilationUnitData[],
): CompilationUnitData {
  const result: CompilationUnitData = {
    knownInputs: {},
    references: [],
  };

  const seenReferenceFromIds = new Set<string>();

  for (const file of metadataFiles) {
    for (const [key, info] of Object.entries(file.knownInputs)) {
      const existing = result.knownInputs[key];
      if (existing === undefined) {
        result.knownInputs[key] = info;
      } else if (existing.isIncompatible === null && info.isIncompatible) {
        // input might not be incompatible in one target, but others might invalidate it.
        // merge the incompatibility state.
        existing.isIncompatible = info.isIncompatible;
      }
    }

    for (const reference of file.references) {
      const referenceId = computeReferenceId(reference);
      if (seenReferenceFromIds.has(referenceId)) {
        continue;
      }
      seenReferenceFromIds.add(referenceId);
      result.references.push(reference);
    }
  }

  return result;
}

/** Computes a unique ID for the given reference. */
function computeReferenceId(
  reference: SerializableForBatching<Reference<InputDescriptor>>,
): string {
  if (reference.kind === ReferenceKind.InTemplate) {
    return `${reference.from.templateFile.id}@@${reference.from.read.positionEndInFile}`;
  } else if (reference.kind === ReferenceKind.InHostBinding) {
    // `read` position is commonly relative to the host property node position— so we need
    // to make it absolute by incorporating the host node position.
    return (
      `${reference.from.file.id}@@${reference.from.hostPropertyNode.positionEndInFile}` +
      `@@${reference.from.read.positionEndInFile}`
    );
  } else {
    return `${reference.from.file.id}@@${reference.from.node.positionEndInFile}`;
  }
}
