/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: This file is based on Angular's `packages/compiler-cli/src/ngtsc/typecheck/src/comments.ts`.
// TODO(atscott): remove this and vitest alias when language service isn't deep importing

import ts from 'typescript';
import {AbsoluteSourceSpan} from '@angular/compiler';

const parseSpanComment = /^(\d+),(\d+)$/;

export function readSpanComment(
  node: ts.Node,
  sourceFile: ts.SourceFile = node.getSourceFile(),
): AbsoluteSourceSpan | null {
  return (
    ts.forEachTrailingCommentRange(
      sourceFile.text,
      node.getEnd(),
      (pos: number, end: number, kind: ts.CommentKind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return undefined;
        }
        const commentText = sourceFile.text.substring(pos + 2, end - 2);
        const match = commentText.match(parseSpanComment);
        if (match === null) {
          return undefined;
        }

        return new AbsoluteSourceSpan(parseInt(match[1], 10), parseInt(match[2], 10));
      },
    ) || null
  );
}

export function hasIgnoreForDiagnosticsMarker(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  return (
    ts.forEachTrailingCommentRange(
      sourceFile.text,
      node.getEnd(),
      (pos: number, end: number, kind: ts.CommentKind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return undefined;
        }
        const commentText = sourceFile.text.substring(pos + 2, end - 2);
        return commentText.trim() === 'D:ignore' ? true : undefined;
      },
    ) === true
  );
}
