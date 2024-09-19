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

export function getCompilationUnitMetadata(knownInputs: KnownInputs) {
  const struct: CompilationUnitData = {
    knownInputs: Array.from(knownInputs.knownInputIds.entries()).reduce(
      (res, [inputClassFieldIdStr, info]) => {
        const classIncompatibility =
          info.container.incompatible !== null
            ? ({kind: IncompatibilityType.VIA_CLASS, reason: info.container.incompatible!} as const)
            : null;
        const memberIncompatibility = info.container.memberIncompatibility.has(inputClassFieldIdStr)
          ? ({
              kind: IncompatibilityType.VIA_INPUT,
              reason: info.container.memberIncompatibility.get(inputClassFieldIdStr)!.reason,
            } as const)
          : null;
        const incompatibility = classIncompatibility ?? memberIncompatibility ?? null;

        // Note: Trim off the `context` as it cannot be serialized with e.g. TS nodes.
        return {
          ...res,
          [inputClassFieldIdStr as string & ClassFieldUniqueKey]: {
            isIncompatible: incompatibility,
            seenAsSourceInput: info.metadata.inSourceFile,
          },
        };
      },
      {} as CompilationUnitData['knownInputs'],
    ),
  };

  return struct;
}
