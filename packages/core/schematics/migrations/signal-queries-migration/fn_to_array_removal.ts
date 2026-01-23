/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../utils/tsurge';
import {ClassFieldDescriptor} from '../signal-migration/src';
import {
  isHostBindingReference,
  isTemplateReference,
  isTsReference,
  Reference,
} from '../signal-migration/src/passes/reference_resolution/reference_kinds';
import {KnownQueries} from './known_queries';
import type {GlobalUnitData} from './migration';
import {checkNonTsReferenceCallsField, checkTsReferenceCallsField} from './property_accesses';

export function removeQueryListToArrayCall(
  ref: Reference<ClassFieldDescriptor>,
  info: ProgramInfo,
  globalMetadata: GlobalUnitData,
  knownQueries: KnownQueries,
  replacements: Replacement[],
): void {
  if (!isHostBindingReference(ref) && !isTemplateReference(ref) && !isTsReference(ref)) {
    return;
  }
  if (knownQueries.isFieldIncompatible(ref.target)) {
    return;
  }

  if (!globalMetadata.knownQueryFields[ref.target.key]?.isMulti) {
    return;
  }

  // TS references.
  if (isTsReference(ref)) {
    const toArrayCallExpr = checkTsReferenceCallsField(ref, 'toArray');
    if (toArrayCallExpr === null) {
      return;
    }
    const toArrayExpr = toArrayCallExpr.expression;

    replacements.push(
      new Replacement(
        projectFile(toArrayExpr.getSourceFile(), info),
        new TextUpdate({
          // Delete from expression end to call end. E.g. `.toArray(<..>)`.
          position: toArrayExpr.expression.getEnd(),
          end: toArrayCallExpr.getEnd(),
          toInsert: '',
        }),
      ),
    );
    return;
  }

  // Template and host binding references.
  const callExpr = checkNonTsReferenceCallsField(ref, 'toArray');
  if (callExpr === null) {
    return;
  }

  const file = isHostBindingReference(ref) ? ref.from.file : ref.from.templateFile;
  const offset = isHostBindingReference(ref) ? ref.from.hostPropertyNode.getStart() + 1 : 0;

  replacements.push(
    new Replacement(
      file,
      new TextUpdate({
        // Delete from expression end to call end. E.g. `.toArray(<..>)`.
        position: offset + callExpr.receiver.receiver.sourceSpan.end,
        end: offset + callExpr.sourceSpan.end,
        toInsert: '',
      }),
    ),
  );
}
