/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceSpan, ParseSpan, Position} from '@angular/compiler';
import * as ts from 'typescript';

import {ClassDeclaration} from '../../reflection';
import {getSourceFile, getTokenAtPosition} from '../../util/src/typescript';

/**
 * FIXME: Taken from packages/compiler-cli/src/transformers/api.ts to prevent circular dep,
 *  modified to account for new span notation.
 */
export interface DiagnosticMessageChain {
  messageText: string;
  position?: Position;
  next?: DiagnosticMessageChain;
}

export interface Diagnostic {
  messageText: string;
  span?: ParseSourceSpan;
  position?: Position;
  chain?: DiagnosticMessageChain;
  category: ts.DiagnosticCategory;
  code: number;
  source: 'angular';
}

export interface SourceLocation {
  sourceReference: string;
  start: number;
  end: number;
}

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
  if (isAbsoluteSpan(span)) {
    commentText = `${span.start},${span.end}`;
  } else {
    commentText = `${span.start.offset},${span.end.offset}`;
  }
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia, commentText,
      /* hasTrailingNewLine */ false);
}

function isAbsoluteSpan(span: AbsoluteSpan | ParseSourceSpan): span is AbsoluteSpan {
  return typeof span.start === 'number';
}

/**
 * Adds a synthetic comment to the function declaration that contains the source location
 * of the class declaration.
 */
export function addSourceReferenceName(
    tcb: ts.FunctionDeclaration, source: ClassDeclaration): void {
  const commentText = getSourceReferenceName(source);
  ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
}

export function getSourceReferenceName(source: ClassDeclaration): string {
  const fileName = getSourceFile(source).fileName;
  return `${fileName}#${source.name.text}`;
}

/**
 * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
 * way TCBs are generated; those diagnostics should not be reported as type check errors of the
 * template.
 */
export function shouldReportDiagnostic(diagnostic: ts.Diagnostic): boolean {
  const {code} = diagnostic;
  if (code === 6133 /* $var is declared but its value is never read. */) {
    return false;
  } else if (code === 6199 /* All variables are unused. */) {
    return false;
  } else if (code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
    return false;
  }
  return true;
}

/**
 * Attempts to translate a TypeScript diagnostic produced during template type-checking to their
 * location of origin, based on the comments that are emitted in the TCB code.
 *
 * If the diagnostic could not be translated, `null` is returned to indicate that the diagnostic
 * should not be reported at all. This prevents diagnostics from non-TCB code in a user's source
 * file from being reported as type-check errors.
 */
export function translateDiagnostic(
    diagnostic: ts.Diagnostic, resolveParseSource: (sourceLocation: SourceLocation) =>
                                   ParseSourceSpan | null): Diagnostic|null {
  if (diagnostic.file === undefined || diagnostic.start === undefined) {
    return null;
  }

  // Locate the node that the diagnostic is reported on and determine its location in the source.
  const node = getTokenAtPosition(diagnostic.file, diagnostic.start);
  const sourceLocation = findSourceLocation(node, diagnostic.file);
  if (sourceLocation === null) {
    return null;
  }

  // Now use the external resolver to obtain the full `ParseSourceFile` of the template.
  const span = resolveParseSource(sourceLocation);
  if (span === null) {
    return null;
  }

  let messageText: string;
  if (typeof diagnostic.messageText === 'string') {
    messageText = diagnostic.messageText;
  } else {
    messageText = diagnostic.messageText.messageText;
  }

  return {
    source: 'angular',
    code: diagnostic.code,
    category: diagnostic.category, messageText, span,
  };
}

function findSourceLocation(node: ts.Node, sourceFile: ts.SourceFile): SourceLocation|null {
  // Search for comments until the TCB's function declaration is encountered.
  while (node !== undefined && !ts.isFunctionDeclaration(node)) {
    const parseSpan =
        ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
          if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
            return null;
          }
          const commentText = sourceFile.text.substring(pos, end);
          return parseParseSpanComment(commentText);
        }) || null;
    if (parseSpan !== null) {
      // Once the positional information has been extracted, search further up the TCB to extract
      // the file information that is attached with the TCB's function declaration.
      return toSourceLocation(parseSpan, node, sourceFile);
    }

    node = node.parent;
  }

  return null;
}

function toSourceLocation(
    parseSpan: ParseSpan, node: ts.Node, sourceFile: ts.SourceFile): SourceLocation|null {
  // Walk up to the function declaration of the TCB, the file information is attached there.
  let tcb = node;
  while (!ts.isFunctionDeclaration(tcb)) {
    tcb = tcb.parent;

    // Bail once we have reached the root.
    if (tcb === undefined) {
      return null;
    }
  }

  const sourceReference =
      ts.forEachLeadingCommentRange(sourceFile.text, tcb.getFullStart(), (pos, end, kind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return null;
        }
        const commentText = sourceFile.text.substring(pos, end);
        return commentText.substring(2, commentText.length - 2);
      }) || null;
  if (sourceReference === null) {
    return null;
  }

  return {
    sourceReference,
    start: parseSpan.start,
    end: parseSpan.end,
  };
}

const parseSpanComment = /^\/\*(\d+),(\d+)\*\/$/;

function parseParseSpanComment(commentText: string): ParseSpan|null {
  const match = commentText.match(parseSpanComment);
  if (match === null) {
    return null;
  }

  return {start: +match[1], end: +match[2]};
}
