/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceSpan, ParseSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {ClassDeclaration} from '../../reflection';
import {getSourceFile} from '../../util/src/typescript';

/**
 * An `AbsoluteSpan` is the result of translating the `ParseSpan` of `AST` template expression nodes
 * to their absolute positions, as the `ParseSpan` is always relative to the start of the
 * expression, not the full template.
 */
export interface AbsoluteSpan {
  __brand__: 'AbsoluteSpan';
  start: number;
  end: number;
}

/**
 * Translates a `ParseSpan` into an `AbsoluteSpan` by incorporating the location information that
 * the `ParseSourceSpan` represents.
 */
export function toAbsoluteSpan(span: ParseSpan, sourceSpan: ParseSourceSpan): AbsoluteSpan {
  const offset = sourceSpan.start.offset;
  return <AbsoluteSpan>{start: span.start + offset, end: span.end + offset};
}

/**
 * Wraps the node in parenthesis such that inserted span comments become attached to the proper
 * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
 * inserted parenthesis are for diagnostic purposes, not for correctness of the rendered TCB code.
 *
 * Note that it is important that nodes and its attached comment are not wrapped into parenthesis
 * by default, as it prevents correct translation of e.g. diagnostics produced for incorrect method
 * arguments. Such diagnostics would then be produced for the parenthesised node whereas the
 * positional comment would be located within that node, resulting in a mismatch.
 */
export function wrapForDiagnostics(expr: ts.Expression): ts.Expression {
  return ts.createParen(expr);
}

/**
 * Adds a synthetic comment to the expression that represents the parse span of the provided node.
 * This comment can later be retrieved as trivia of a node to recover original source locations.
 */
export function addParseSpanInfo(node: ts.Node, span: AbsoluteSpan | ParseSourceSpan): void {
  let commentText: string;
  if (typeof span.start === 'number') {
    commentText = `${span.start},${span.end}`;
  } else {
    const {start, end} = span as ParseSourceSpan;
    commentText = `${start.offset},${end.offset}`;
  }
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia, commentText,
      /* hasTrailingNewLine */ false);
}

/**
 * Adds a synthetic comment to the function declaration that contains the source location
 * of the class declaration.
 */
export function addSourceInfo(
    tcb: ts.FunctionDeclaration, source: ClassDeclaration<ts.ClassDeclaration>): void {
  const fileName = getSourceFile(source).fileName;
  const commentText = `${fileName}#${source.name.text}`;
  ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
}
