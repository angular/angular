/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputs} from '../input_detection/known_inputs';
import {InputUniqueKey} from '../utils/input_id';
import {CompilationUnitData, IncompatibilityType, MetadataFile} from './metadata_file';

/**
 * Batch mode.
 *
 * Migrates the given compilation unit, leveraging the global analysis metadata
 * that was created as the merge of all individual project units.
 *
 * TODO: Remove when 1P code uses go/tsurge.
 */
export function migrateTarget(_absoluteTsconfigPath: string, _mergedMetadata: MetadataFile) {
  return {
    replacements: new Map<string, Array<{pos: number; end: number; toInsert: string}>>(),
  };
}

export function populateKnownInputsFromGlobalData(
  knownInputs: KnownInputs,
  globalData: CompilationUnitData,
) {
  // Populate from batch metadata.
  for (const [_key, info] of Object.entries(globalData.knownInputs)) {
    const key = _key as unknown as InputUniqueKey;

    // irrelevant for this compilation unit.
    if (!knownInputs.has({key})) {
      continue;
    }

    const inputMetadata = knownInputs.get({key})!;
    if (!inputMetadata.isIncompatible() && info.isIncompatible) {
      if (info.isIncompatible.kind === IncompatibilityType.VIA_CLASS) {
        knownInputs.markDirectiveAsIncompatible(
          inputMetadata.container.clazz,
          info.isIncompatible.reason,
        );
      } else {
        knownInputs.markInputAsIncompatible(inputMetadata.descriptor, {
          context: null, // No context serializable.
          reason: info.isIncompatible.reason,
        });
      }
    }
  }
}
