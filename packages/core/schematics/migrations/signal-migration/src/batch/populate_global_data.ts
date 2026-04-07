/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KnownInputs} from '../input_detection/known_inputs';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';
import {CompilationUnitData} from './unit_data';

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
    if (info.memberIncompatibility !== null) {
      knownInputs.markFieldIncompatible(inputMetadata.descriptor, {
        context: null, // No context serializable.
        reason: info.memberIncompatibility,
      });
    }

    if (info.owningClassIncompatibility !== null) {
      knownInputs.markClassIncompatible(
        inputMetadata.container.clazz,
        info.owningClassIncompatibility,
      );
    }
  }
}
