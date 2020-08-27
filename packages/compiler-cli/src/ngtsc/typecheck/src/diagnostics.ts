/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {getTokenAtPosition} from '../../util/src/typescript';
import {TemplateId, TemplateSourceMapping} from '../api';
import {makeTemplateDiagnostic, TemplateDiagnostic} from '../diagnostics';

import {hasIgnoreMarker, readSpanComment} from './comments';


/**
 * Adapter interface which allows the template type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to original locations in the template.
 */
export interface TemplateSourceResolver {
  getTemplateId(node: ts.ClassDeclaration): TemplateId;

  /**
   * For the given template id, retrieve the original source mapping which describes how the offsets
   * in the template should be interpreted.
   */
  getSourceMapping(id: TemplateId): TemplateSourceMapping;

  /**
   * Convert an absolute source span associated with the given template id into a full
   * `ParseSourceSpan`. The returned parse span has line and column numbers in addition to only
   * absolute offsets and gives access to the original template source.
   */
  toParseSourceSpan(id: TemplateId, span: AbsoluteSourceSpan): ParseSourceSpan|null;
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
 * Wraps the node in parenthesis such that inserted span comments become attached to the proper
 * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
 * inserted parenthesis are for use by the type checker, not for correctness of the rendered TCB
 * code.
 */
export function wrapForTypeChecker(expr: ts.Expression): ts.Expression {
  return ts.createParen(expr);
}

/**
 * Adds a synthetic comment to the expression that represents the parse span of the provided node.
 * This comment can later be retrieved as trivia of a node to recover original source locations.
 */
export function addParseSpanInfo(node: ts.Node, span: AbsoluteSourceSpan|ParseSourceSpan): void {
  let commentText: string;
  if (span instanceof AbsoluteSourceSpan) {
    commentText = `${span.start},${span.end}`;
  } else {
    commentText = `${span.start.offset},${span.end.offset}`;
  }
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
}

/**
 * Adds a synthetic comment to the function declaration that contains the template id
 * of the class declaration.
 */
export function addTemplateId(tcb: ts.FunctionDeclaration, id: TemplateId): void {
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
    diagnostic: ts.Diagnostic, resolver: TemplateSourceResolver): TemplateDiagnostic|null {
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
  const span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
  if (span === null) {
    return null;
  }

  const mapping = resolver.getSourceMapping(sourceLocation.id);
  return makeTemplateDiagnostic(
      sourceLocation.id, mapping, span, diagnostic.category, diagnostic.code,
      diagnostic.messageText);
}

export function findTypeCheckBlock(file: ts.SourceFile, id: TemplateId): ts.Node|null {
  for (const stmt of file.statements) {
    if (ts.isFunctionDeclaration(stmt) && getTemplateId(stmt, file) === id) {
      return stmt;
    }
  }
  return null;
}

interface SourceLocation {
  id: TemplateId;
  span: AbsoluteSourceSpan;
}

/**
 * Traverses up the AST starting from the given node to extract the source location from comments
 * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
 * marker comment is found up the tree, this function returns null.
 */
function findSourceLocation(node: ts.Node, sourceFile: ts.SourceFile): SourceLocation|null {
  // Search for comments until the TCB's function declaration is encountered.
  while (node !== undefined && !ts.isFunctionDeclaration(node)) {
    if (hasIgnoreMarker(node, sourceFile)) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }

    const span = readSpanComment(node, sourceFile);
    if (span !== null) {
      // Once the positional information has been extracted, search further up the TCB to extract
      // the unique id that is attached with the TCB's function declaration.
      const id = getTemplateId(node, sourceFile);
      if (id === null) {
        return null;
      }
      return {id, span};
    }

    node = node.parent;
  }

  return null;
}

function getTemplateId(node: ts.Node, sourceFile: ts.SourceFile): TemplateId|null {
  // Walk up to the function declaration of the TCB, the file information is attached there.
  while (!ts.isFunctionDeclaration(node)) {
    if (hasIgnoreMarker(node, sourceFile)) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }
    node = node.parent;

    // Bail once we have reached the root.
    if (node === undefined) {
      return null;
    }
  }

  const start = node.getFullStart();
  return ts.forEachLeadingCommentRange(sourceFile.text, start, (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText;
  }) as TemplateId || null;
}
