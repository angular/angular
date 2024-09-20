/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Try to guess the indentation of the node.
 *
 * This function returns the indentation only if the start character of this node is
 * the first non-whitespace character in a line where the node is, otherwise,
 * it returns `undefined`. When computing the start of the node, it should include
 * the leading comments.
 */
export function guessIndentationInSingleLine(
  node: ts.Node,
  sourceFile: ts.SourceFile,
): number | undefined {
  const leadingComment = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
  const firstLeadingComment =
    leadingComment !== undefined && leadingComment.length > 0 ? leadingComment[0] : undefined;
  const nodeStartWithComment = firstLeadingComment?.pos ?? node.getStart();
  const lineNumber = sourceFile.getLineAndCharacterOfPosition(nodeStartWithComment).line;
  const lineStart = sourceFile.getLineStarts()[lineNumber];

  let haveChar = false;
  for (let pos = lineStart; pos < nodeStartWithComment; pos++) {
    const ch = sourceFile.text.charCodeAt(pos);
    if (!ts.isWhiteSpaceSingleLine(ch)) {
      haveChar = true;
      break;
    }
  }
  return haveChar ? undefined : nodeStartWithComment - lineStart;
}
