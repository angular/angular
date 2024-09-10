/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputs} from '../input_detection/known_inputs';
import {ClassFieldUniqueKey} from '../passes/reference_resolution/known_fields';
import {
  isHostBindingReference,
  isTsClassTypeReference,
  isTsReference,
} from '../passes/reference_resolution/reference_kinds';
import {MigrationResult} from '../result';
import {CompilationUnitData, IncompatibilityType} from './unit_data';

export function getCompilationUnitMetadata(knownInputs: KnownInputs, result: MigrationResult) {
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
          },
        };
      },
      {} as CompilationUnitData['knownInputs'],
    ),
    references: result.references.map((r) => {
      if (isTsReference(r)) {
        return {
          kind: r.kind,
          target: r.target.key,
          from: {
            file: r.from.file,
            node: {positionEndInFile: r.from.node.getEnd()},
            isWrite: r.from.isWrite,
            isPartOfElementBinding: r.from.isPartOfElementBinding,
          },
        };
      } else if (isHostBindingReference(r)) {
        return {
          kind: r.kind,
          target: r.target.key,
          from: {
            file: r.from.file,
            hostPropertyNode: {positionEndInFile: r.from.hostPropertyNode.getEnd()},
            isObjectShorthandExpression: r.from.isObjectShorthandExpression,
            isWrite: r.from.isWrite,
            read: {positionEndInFile: r.from.read.sourceSpan.end},
          },
        };
      } else if (isTsClassTypeReference(r)) {
        return {
          kind: r.kind,
          target: {positionEndInFile: r.target.getEnd()},
          from: {
            file: r.from.file,
            node: {positionEndInFile: r.from.node.getEnd()},
          },
          isPartOfCatalystFile: r.isPartOfCatalystFile,
          isPartialReference: r.isPartialReference,
        };
      }
      return {
        kind: r.kind,
        target: r.target.key,
        from: {
          originatingTsFile: r.from.originatingTsFile,
          templateFile: r.from.templateFile,
          isObjectShorthandExpression: r.from.isObjectShorthandExpression,
          isLikelyPartOfNarrowing: r.from.isLikelyPartOfNarrowing,
          isWrite: r.from.isWrite,
          node: {positionEndInFile: r.from.node.sourceSpan.end.offset},
          read: {positionEndInFile: r.from.read.sourceSpan.end},
        },
      };
    }),
  };

  return struct;
}
