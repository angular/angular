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
import {checkNonTsReferenceAccessesField, checkTsReferenceAccessesField} from './property_accesses';

const mapping = new Map([
  ['first', 'at(0)!'],
  ['last', 'at(-1)!'],
]);

export function replaceQueryListFirstAndLastReferences(
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

  if (isTsReference(ref)) {
    const expr =
      checkTsReferenceAccessesField(ref, 'first') ?? checkTsReferenceAccessesField(ref, 'last');
    if (expr === null) {
      return;
    }

    replacements.push(
      new Replacement(
        projectFile(expr.getSourceFile(), info),
        new TextUpdate({
          position: expr.name.getStart(),
          end: expr.name.getEnd(),
          toInsert: mapping.get(expr.name.text)!,
        }),
      ),
    );
    return;
  }

  // Template and host binding references.
  const expr =
    checkNonTsReferenceAccessesField(ref, 'first') ?? checkNonTsReferenceAccessesField(ref, 'last');
  if (expr === null) {
    return;
  }

  const file = isHostBindingReference(ref) ? ref.from.file : ref.from.templateFile;
  const offset = isHostBindingReference(ref) ? ref.from.hostPropertyNode.getStart() + 1 : 0;

  replacements.push(
    new Replacement(
      file,
      new TextUpdate({
        position: offset + expr.nameSpan.start,
        end: offset + expr.nameSpan.end,
        toInsert: mapping.get(expr.name)!,
      }),
    ),
  );
}
