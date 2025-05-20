/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import ts from 'typescript';

import {TemplateDiagnostic, TypeCheckId} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {getSourceMapping, TypeCheckSourceResolver} from './tcb_util';

/**
 * Wraps the node in parenthesis such that inserted span comments become attached to the proper
 * node. This is an alias for `ts.factory.createParenthesizedExpression` with the benefit that it
 * signifies that the inserted parenthesis are for diagnostic purposes, not for correctness of the
 * rendered TCB code.
 *
 * Note that it is important that nodes and its attached comment are not wrapped into parenthesis
 * by default, as it prevents correct translation of e.g. diagnostics produced for incorrect method
 * arguments. Such diagnostics would then be produced for the parenthesised node whereas the
 * positional comment would be located within that node, resulting in a mismatch.
 */
export function wrapForDiagnostics(expr: ts.Expression): ts.Expression {
  return ts.factory.createParenthesizedExpression(expr);
}

/**
 * Wraps the node in parenthesis such that inserted span comments become attached to the proper
 * node. This is an alias for `ts.factory.createParenthesizedExpression` with the benefit that it
 * signifies that the inserted parenthesis are for use by the type checker, not for correctness of
 * the rendered TCB code.
 */
export function wrapForTypeChecker(expr: ts.Expression): ts.Expression {
  return ts.factory.createParenthesizedExpression(expr);
}

/**
 * Adds a synthetic comment to the expression that represents the parse span of the provided node.
 * This comment can later be retrieved as trivia of a node to recover original source locations.
 */
export function addParseSpanInfo(node: ts.Node, span: AbsoluteSourceSpan | ParseSourceSpan): void {
  let commentText: string;
  if (span instanceof AbsoluteSourceSpan) {
    commentText = `${span.start},${span.end}`;
  } else {
    commentText = `${span.start.offset},${span.end.offset}`;
  }
  ts.addSyntheticTrailingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    commentText,
    /* hasTrailingNewLine */ false,
  );
}

/**
 * Adds a synthetic comment to the function declaration that contains the type checking ID
 * of the class declaration.
 */
export function addTypeCheckId(tcb: ts.FunctionDeclaration, id: TypeCheckId): void {
  ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, id, true);
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
  } else if (code === 7006 /* Parameter '$event' implicitly has an 'any' type. */) {
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
  diagnostic: ts.Diagnostic,
  resolver: TypeCheckSourceResolver,
): TemplateDiagnostic | null {
  if (diagnostic.file === undefined || diagnostic.start === undefined) {
    return null;
  }
  const fullMapping = getSourceMapping(
    diagnostic.file,
    diagnostic.start,
    resolver,
    /*isDiagnosticsRequest*/ true,
  );
  if (fullMapping === null) {
    return null;
  }

  const {sourceLocation, sourceMapping: templateSourceMapping, span} = fullMapping;
  return makeTemplateDiagnostic(
    sourceLocation.id,
    templateSourceMapping,
    span,
    diagnostic.category,
    diagnostic.code,
    diagnostic.messageText,
  );
}
