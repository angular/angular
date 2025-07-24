/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Gets the leading line whitespace of a given node.
 *
 * Useful for inserting e.g. TODOs without breaking indentation.
 */
export function getLeadingLineWhitespaceOfNode(node: ts.Node): string {
  const fullText = node.getFullText().substring(0, node.getStart() - node.getFullStart());
  let result = '';

  for (let i = fullText.length - 1; i > -1; i--) {
    // Note: LF line endings are `\n` while CRLF are `\r\n`. This logic should cover both, because
    // we start from the beginning of the node and go backwards so will always hit `\n` first.
    if (fullText[i] !== '\n') {
      result = fullText[i] + result;
    } else {
      break;
    }
  }

  return result;
}
