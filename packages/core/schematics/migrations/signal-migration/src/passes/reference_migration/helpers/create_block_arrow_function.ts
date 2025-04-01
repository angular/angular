/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProjectFile, Replacement, TextUpdate} from '../../../../../../utils/tsurge';

/**
 * Creates replacements to insert the given statement as
 * first statement into the arrow function.
 *
 * The arrow function is converted to a block-based arrow function
 * that can hold multiple statements. The original expression is
 * simply returned like before.
 */
export function createNewBlockToInsertVariable(
  node: ts.ArrowFunction,
  file: ProjectFile,
  toInsert: string,
): Replacement[] {
  const sf = node.getSourceFile();

  // For indentation, we traverse up and find the earliest statement.
  // This node is most of the time a good candidate for acceptable
  // indentation of a new block.
  const spacingNode = ts.findAncestor(node, ts.isStatement) ?? node.parent;
  const {character} = ts.getLineAndCharacterOfPosition(sf, spacingNode.getStart());
  const blockSpace = ' '.repeat(character);
  const contentSpace = ' '.repeat(character + 2);

  return [
    // Delete leading whitespace of the concise body.
    new Replacement(
      file,
      new TextUpdate({
        position: node.body.getFullStart(),
        end: node.body.getStart(),
        toInsert: '',
      }),
    ),
    // Insert leading block braces, and `toInsert` content.
    // Wrap the previous expression in a return now.
    new Replacement(
      file,
      new TextUpdate({
        position: node.body.getStart(),
        end: node.body.getStart(),
        toInsert: ` {\n${contentSpace}${toInsert}\n${contentSpace}return `,
      }),
    ),
    // Add trailing brace.
    new Replacement(
      file,
      new TextUpdate({
        position: node.body.getEnd(),
        end: node.body.getEnd(),
        toInsert: `;\n${blockSpace}}`,
      }),
    ),
  ];
}
