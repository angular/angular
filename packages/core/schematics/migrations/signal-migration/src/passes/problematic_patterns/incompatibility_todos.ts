/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProgramInfo, Replacement} from '../../../../../utils/tsurge';
import {
  getMessageForClassIncompatibility,
  getMessageForFieldIncompatibility,
} from './incompatibility_human';
import {insertPrecedingLine} from '../../../../../utils/tsurge/helpers/ast/insert_preceding_line';
import {cutStringToLineLimit} from '../../../../../utils/tsurge/helpers/string_manipulation/cut_string_line_length';
import {
  ClassIncompatibilityReason,
  FieldIncompatibility,
  FieldIncompatibilityReason,
  isFieldIncompatibility,
} from './incompatibility';
import ts from 'typescript';

/**
 * Inserts a TODO for the incompatibility blocking the given node
 * from being migrated.
 */
export function insertTodoForIncompatibility(
  node: ts.ClassElement,
  programInfo: ProgramInfo,
  incompatibility: FieldIncompatibility | ClassIncompatibilityReason,
  fieldName: {single: string; plural: string},
): Replacement[] {
  // If a field is skipped via config filter or outside migration scope, do not
  // insert TODOs, as this could results in lots of unnecessary comments.
  if (
    isFieldIncompatibility(incompatibility) &&
    (incompatibility.reason === FieldIncompatibilityReason.SkippedViaConfigFilter ||
      incompatibility.reason === FieldIncompatibilityReason.OutsideOfMigrationScope)
  ) {
    return [];
  }

  const message = isFieldIncompatibility(incompatibility)
    ? getMessageForFieldIncompatibility(incompatibility.reason, fieldName).short
    : getMessageForClassIncompatibility(incompatibility, fieldName).short;
  const lines = cutStringToLineLimit(message, 70);

  return [
    insertPrecedingLine(node, programInfo, `// TODO: Skipped for migration because:`),
    ...lines.map((line) => insertPrecedingLine(node, programInfo, `//  ${line}`)),
  ];
}
