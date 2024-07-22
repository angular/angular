/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createAndPrepareAnalysisProgram} from '../create_program';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {pass4__checkInheritanceOfInputs} from '../passes/4_check_inheritance';
import {executeAnalysisPhase} from '../phase_analysis';
import {MigrationResult} from '../result';
import {InputUniqueKey} from '../utils/input_id';
import {
  isHostBindingInputReference,
  isTsInputClassTypeReference,
  isTsInputReference,
} from '../utils/input_reference';
import {IncompatibilityType, MetadataFile} from './metadata_file';

/**
 * Batch mode.
 *
 * Analyzes and extracts metadata for the given TypeScript target. The
 * resolved metadata is returned and can be merged later.
 */
export function extract(absoluteTsconfigPath: string) {
  const analysisDeps = createAndPrepareAnalysisProgram(absoluteTsconfigPath);
  const {tsconfig, basePath, metaRegistry, sourceFiles} = analysisDeps;
  const knownInputs = new KnownInputs();
  const result = new MigrationResult();
  const host = new MigrationHost(
    /* projectDir */ tsconfig.options.rootDir ?? basePath,
    /* isMigratingCore */ true,
    tsconfig.options,
    sourceFiles,
  );

  const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
  pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);

  const struct: MetadataFile = {
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
      {} as MetadataFile['knownInputs'],
    ),
    references: result.references.map((r) => {
      if (isTsInputReference(r)) {
        return {
          kind: r.kind,
          target: r.target.key,
          from: {
            fileId: r.from.fileId,
            node: {positionEndInFile: r.from.node.getEnd()},
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
