/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownInputInfo} from '../input_detection/known_inputs';
import {ProgramInfo, Replacement} from '../../../../utils/tsurge';
import {isInputMemberIncompatibility} from '../input_detection/incompatibility';
import {
  getMessageForClassIncompatibility,
  getMessageForInputIncompatibility,
} from '../input_detection/incompatibility_human';
import {insertPrecedingLine} from '../../../../utils/tsurge/helpers/ast/insert_preceding_line';
import {InputNode} from '../input_detection/input_node';
import {cutStringToLineLimit} from '../../../../utils/tsurge/helpers/string_manipulation/cut_string_line_length';

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

  const message = isInputMemberIncompatibility(incompatibility)
    ? getMessageForInputIncompatibility(incompatibility.reason).short
    : getMessageForClassIncompatibility(incompatibility).short;
  const lines = cutStringToLineLimit(message, 70);

  return [
    insertPrecedingLine(node, programInfo, `// TODO: Skipped for migration because:`),
    ...lines.map((line) => insertPrecedingLine(node, programInfo, `//  ${line}`)),
  ];
}
