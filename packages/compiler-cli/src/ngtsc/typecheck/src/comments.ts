/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

const parseSpanComment = /^(\d+),(\d+)$/;

/**
 * Reads the trailing comments and finds the first match which is a span comment (i.e. 4,10) on a
 * node and returns it as an `AbsoluteSourceSpan`.
 *
 * Will return `null` if no trailing comments on the node match the expected form of a source span.
 */
export function readSpanComment(sourceFile: ts.SourceFile, node: ts.Node): AbsoluteSourceSpan|null {
  return ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    const match = commentText.match(parseSpanComment);
    if (match === null) {
      return null;
    }

    return new AbsoluteSourceSpan(+match[1], +match[2]);
  }) || null;
}

/** Used to identify what type the comment is. */
export enum CommentTriviaType {
  DIAGNOSTIC = 'D',
  EXPRESSION_TYPE_IDENTIFIER = 'T',
}

/** Identifies what the TCB expression is for (for example, a directive declaration). */
export enum ExpressionIdentifier {
  DIRECTIVE = 'DIR',
}

/** Tags the node with the given expression identifier. */
export function addExpressionIdentifier(node: ts.Node, identifier: ExpressionIdentifier) {
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia,
      `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}`,
      /* hasTrailingNewLine */ false);
}

export const IGNORE_MARKER = `${CommentTriviaType.DIAGNOSTIC}:ignore`;

/**
 * Tag the `ts.Node` with an indication that any errors arising from the evaluation of the node
 * should be ignored.
 */
export function markIgnoreDiagnostics(node: ts.Node): void {
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia, IGNORE_MARKER, /* hasTrailingNewLine */ false);
}

/** Returns true if the node has a marker that indicates diagnostics errors should be ignored.  */
export function hasIgnoreMarker(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  return ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText === IGNORE_MARKER;
  }) === true;
}
