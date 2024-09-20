/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {Replacement, TextUpdate} from '../../replacement';
import {getLeadingLineWhitespaceOfNode} from './leading_space';
import {ProgramInfo} from '../../program_info';
import {projectFile} from '../../project_paths';

/**
 * Inserts a leading single-line TODO for the given node,
 * returning a replacement.
 */
export function insertPrecedingLine(
  node: ts.Node,
  info: ProgramInfo,
  todoText: string,
): Replacement {
  const leadingSpace = getLeadingLineWhitespaceOfNode(node);
  return new Replacement(
    projectFile(node.getSourceFile(), info),
    new TextUpdate({
      position: node.getStart(),
      end: node.getStart(),
      toInsert: `${todoText}\n${leadingSpace}`,
    }),
  );
}
