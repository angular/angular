/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {getTokenAtPosition} from '../../util/src/typescript';

import {ExternalTemplateSourceMapping, TemplateId, TemplateSourceMapping} from './api';

/**
 * A `ts.Diagnostic` with additional information about the diagnostic related to template
 * type-checking.
 */
export interface TemplateDiagnostic extends ts.Diagnostic {
  /**
   * The component with the template that resulted in this diagnostic.
   */
  componentFile: ts.SourceFile;
}

/**
 * Adapter interface which allows the template type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to original locations in the template.
 */
export interface TemplateSourceResolver {
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

const IGNORE_MARKER = 'ignore';

/**
 * Adds a marker to the node that signifies that any errors within the node should not be reported.
 */
export function ignoreDiagnostics(node: ts.Node): void {
  ts.addSyntheticTrailingComment(
      node, ts.SyntaxKind.MultiLineCommentTrivia, IGNORE_MARKER, /* hasTrailingNewLine */ false);
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
    diagnostic: ts.Diagnostic, resolver: TemplateSourceResolver): ts.Diagnostic|null {
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
      mapping, span, diagnostic.category, diagnostic.code, diagnostic.messageText);
}

/**
 * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
 */
export function makeTemplateDiagnostic(
    mapping: TemplateSourceMapping, span: ParseSourceSpan, category: ts.DiagnosticCategory,
    code: number, messageText: string|ts.DiagnosticMessageChain, relatedMessage?: {
      text: string,
      span: ParseSourceSpan,
    }): TemplateDiagnostic {
  if (mapping.type === 'direct') {
    let relatedInformation: ts.DiagnosticRelatedInformation[]|undefined = undefined;
    if (relatedMessage !== undefined) {
      relatedInformation = [{
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: mapping.node.getSourceFile(),
        start: relatedMessage.span.start.offset,
        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
        messageText: relatedMessage.text,
      }];
    }
    // For direct mappings, the error is shown inline as ngtsc was able to pinpoint a string
    // constant within the `@Component` decorator for the template. This allows us to map the error
    // directly into the bytes of the source file.
    return {
      source: 'ngtsc',
      code,
      category,
      messageText,
      file: mapping.node.getSourceFile(),
      componentFile: mapping.node.getSourceFile(),
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      relatedInformation,
    };
  } else if (mapping.type === 'indirect' || mapping.type === 'external') {
    // For indirect mappings (template was declared inline, but ngtsc couldn't map it directly
    // to a string constant in the decorator), the component's file name is given with a suffix
    // indicating it's not the TS file being displayed, but a template.
    // For external temoplates, the HTML filename is used.
    const componentSf = mapping.componentClass.getSourceFile();
    const componentName = mapping.componentClass.name.text;
    // TODO(alxhub): remove cast when TS in g3 supports this narrowing.
    const fileName = mapping.type === 'indirect' ?
        `${componentSf.fileName} (${componentName} template)` :
        (mapping as ExternalTemplateSourceMapping).templateUrl;
    // TODO(alxhub): investigate creating a fake `ts.SourceFile` here instead of invoking the TS
    // parser against the template (HTML is just really syntactically invalid TypeScript code ;).
    // Also investigate caching the file to avoid running the parser multiple times.
    const sf = ts.createSourceFile(
        fileName, mapping.template, ts.ScriptTarget.Latest, false, ts.ScriptKind.JSX);

    let relatedInformation: ts.DiagnosticRelatedInformation[] = [];
    if (relatedMessage !== undefined) {
      relatedInformation.push({
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: sf,
        start: relatedMessage.span.start.offset,
        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
        messageText: relatedMessage.text,
      });
    }

    relatedInformation.push({
      category: ts.DiagnosticCategory.Message,
      code: 0,
      file: componentSf,
      // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
      // and getEnd() are used because they don't include surrounding whitespace.
      start: mapping.node.getStart(),
      length: mapping.node.getEnd() - mapping.node.getStart(),
      messageText: `Error occurs in the template of component ${componentName}.`,
    });

    return {
      source: 'ngtsc',
      category,
      code,
      messageText,
      file: sf,
      componentFile: componentSf,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      // Show a secondary message indicating the component whose template contains the error.
      relatedInformation,
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${(mapping as {type: string}).type}`);
  }
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

    const span = readSpanComment(sourceFile, node);
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

const parseSpanComment = /^(\d+),(\d+)$/;

function readSpanComment(sourceFile: ts.SourceFile, node: ts.Node): AbsoluteSourceSpan|null {
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

function hasIgnoreMarker(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  return ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText === IGNORE_MARKER;
  }) === true;
}

export function isTemplateDiagnostic(diagnostic: ts.Diagnostic): diagnostic is TemplateDiagnostic {
  return diagnostic.hasOwnProperty('componentFile') &&
      ts.isSourceFile((diagnostic as any).componentFile);
}
