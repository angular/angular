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

export function getCompilationUnitMetadata(knownInputs: KnownInputs) {
  const struct: CompilationUnitData = {
    knownInputs: Array.from(knownInputs.knownInputIds.entries()).reduce(
      (res, [inputClassFieldIdStr, info]) => {
        const classIncompatibility =
          info.container.incompatible !== null ? info.container.incompatible : null;
        const memberIncompatibility = info.container.memberIncompatibility.has(inputClassFieldIdStr)
          ? info.container.memberIncompatibility.get(inputClassFieldIdStr)!.reason
          : null;

        // Note: Trim off the `context` as it cannot be serialized with e.g. TS nodes.
        return {
          ...res,
          [inputClassFieldIdStr as string & ClassFieldUniqueKey]: {
            owningClassIncompatibility: classIncompatibility,
            memberIncompatibility,
            seenAsSourceInput: info.metadata.inSourceFile,
            extendsFrom: info.extendsFrom?.key ?? null,
          },
        };
      },
      {} as CompilationUnitData['knownInputs'],
    ),
  };

  return struct;
}
