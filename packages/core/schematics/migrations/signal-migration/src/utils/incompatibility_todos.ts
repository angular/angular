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
  const lines = cutStringToWordLimit(message, 70);

  return [
    insertPrecedingLine(node, programInfo, `// TODO: Skipped for migration because:`),
    ...lines.map((line) => insertPrecedingLine(node, programInfo, `//  ${line}`)),
  ];
}

/**
 * Cuts the given string into lines basing around the specified
 * line length limit. This function breaks the string on a per-word basis.
 */
function cutStringToWordLimit(str: string, limit: number): string[] {
  const words = str.split(' ');
  const chunks: string[] = [];
  let chunkIdx = 0;

  while (words.length) {
    // New line if we exceed limit.
    if (chunks[chunkIdx] !== undefined && chunks[chunkIdx].length > limit) {
      chunkIdx++;
    }
    // Ensure line is initialized for the given index.
    if (chunks[chunkIdx] === undefined) {
      chunks[chunkIdx] = '';
    }

    const word = words.shift();
    const needsSpace = chunks[chunkIdx].length > 0;

    // Insert word. Add space before, if the line already contains text.
    chunks[chunkIdx] += `${needsSpace ? ' ' : ''}${word}`;
  }

  return chunks;
}
