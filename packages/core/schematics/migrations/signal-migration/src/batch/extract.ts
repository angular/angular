/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationResult} from '../result';
import {InputUniqueKey} from '../utils/input_id';
import {
  isHostBindingInputReference,
  isTsInputClassTypeReference,
  isTsInputReference,
} from '../utils/input_reference';
import {CompilationUnitData, IncompatibilityType} from './unit_data';

export function getCompilationUnitMetadata(knownInputs: KnownInputs, result: MigrationResult) {
  const struct: CompilationUnitData = {
    knownInputs: Array.from(knownInputs.knownInputIds.entries()).reduce(
      (res, [inputIdStr, info]) => {
        const classIncompatibility =
          info.container.incompatible !== null
            ? ({kind: IncompatibilityType.VIA_CLASS, reason: info.container.incompatible!} as const)
            : null;
        const memberIncompatibility = info.container.memberIncompatibility.has(inputIdStr)
          ? ({
              kind: IncompatibilityType.VIA_INPUT,
              reason: info.container.memberIncompatibility.get(inputIdStr)!.reason,
            } as const)
          : null;
        const incompatibility = classIncompatibility ?? memberIncompatibility ?? null;

        // Note: Trim off the `context` as it cannot be serialized with e.g. TS nodes.
        return {
          ...res,
          [inputIdStr as string & InputUniqueKey]: {
            isIncompatible: incompatibility,
          },
        };
      },
      {} as CompilationUnitData['knownInputs'],
    ),
    references: result.references.map((r) => {
      if (isTsInputReference(r)) {
        return {
          kind: r.kind,
          target: r.target.key,
          from: {
            fileId: r.from.fileId,
            node: {positionEndInFile: r.from.node.getEnd()},
            isWrite: r.from.isWrite,
            isPartOfElementBinding: r.from.isPartOfElementBinding,
          },
        };
      } else if (isHostBindingInputReference(r)) {
        return {
          kind: r.kind,
          target: r.target.key,
          from: {
            fileId: r.from.fileId,
            hostPropertyNode: {positionEndInFile: r.from.hostPropertyNode.getEnd()},
            isObjectShorthandExpression: r.from.isObjectShorthandExpression,
            read: {positionEndInFile: r.from.read.sourceSpan.end},
          },
        };
      } else if (isTsInputClassTypeReference(r)) {
        return {
          kind: r.kind,
          target: {positionEndInFile: r.target.getEnd()},
          from: {
            fileId: r.from.fileId,
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
          originatingTsFileId: r.from.originatingTsFileId,
          templateFileId: r.from.templateFileId,
          isObjectShorthandExpression: r.from.isObjectShorthandExpression,
          node: {positionEndInFile: r.from.node.sourceSpan.end.offset},
          read: {positionEndInFile: r.from.read.sourceSpan.end},
        },
      };
    }),
  };

  return struct;
}
