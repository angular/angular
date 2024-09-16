/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputs} from '../input_detection/known_inputs';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';
import {CompilationUnitData, IncompatibilityType} from './unit_data';

export function populateKnownInputsFromGlobalData(
  knownInputs: KnownInputs,
  globalData: CompilationUnitData,
) {
  // Populate from batch metadata.
  for (const [_key, info] of Object.entries(globalData.knownInputs)) {
    const key = _key as unknown as ClassFieldUniqueKey;

    // irrelevant for this compilation unit.
    if (!knownInputs.has({key})) {
      continue;
    }

    const inputMetadata = knownInputs.get({key})!;
    if (!inputMetadata.isIncompatible() && info.isIncompatible) {
      if (info.isIncompatible.kind === IncompatibilityType.VIA_CLASS) {
        knownInputs.markClassIncompatible(
          inputMetadata.container.clazz,
          info.isIncompatible.reason,
        );
      } else {
        knownInputs.markFieldIncompatible(inputMetadata.descriptor, {
          context: null, // No context serializable.
          reason: info.isIncompatible.reason,
        });
      }
    }
  }
}
