/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputInfo} from '../input_detection/known_inputs';
import {ProgramInfo, Replacement} from '../../../../utils/tsurge';
import {
  getMessageForClassIncompatibility,
  getMessageForFieldIncompatibility,
} from '../passes/problematic_patterns/incompatibility_human';
import {insertPrecedingLine} from '../../../../utils/tsurge/helpers/ast/insert_preceding_line';
import {InputNode} from '../input_detection/input_node';
import {cutStringToLineLimit} from '../../../../utils/tsurge/helpers/string_manipulation/cut_string_line_length';
import {
  FieldIncompatibilityReason,
  isFieldIncompatibility,
} from '../passes/problematic_patterns/incompatibility';

/**
 * Inserts a TODO for the incompatibility blocking the given node
 * from being migrated.
 */
export function insertTodoForIncompatibility(
  node: InputNode,
  programInfo: ProgramInfo,
  input: KnownInputInfo,
): Replacement[] {
  const incompatibility = input.container.getInputMemberIncompatibility(input.descriptor);
  if (incompatibility === null) {
    return [];
  }

  // If an input is skipped via config filter or outside migration scope, do not
  // insert TODOs, as this could results in lots of unnecessary comments.
  if (
    isFieldIncompatibility(incompatibility) &&
    (incompatibility.reason === FieldIncompatibilityReason.SkippedViaConfigFilter ||
      incompatibility.reason === FieldIncompatibilityReason.OutsideOfMigrationScope)
  ) {
    return [];
  }

  const message = isFieldIncompatibility(incompatibility)
    ? getMessageForFieldIncompatibility(incompatibility.reason, {single: 'input', plural: 'inputs'})
        .short
    : getMessageForClassIncompatibility(incompatibility, {single: 'input', plural: 'inputs'}).short;
  const lines = cutStringToLineLimit(message, 70);

  return [
    insertPrecedingLine(node, programInfo, `// TODO: Skipped for migration because:`),
    ...lines.map((line) => insertPrecedingLine(node, programInfo, `//  ${line}`)),
  ];
}
