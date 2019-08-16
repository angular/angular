/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceSpan, ParseSpan, Position} from '@angular/compiler';
import * as ts from 'typescript';

import {getTokenAtPosition} from '../../util/src/typescript';

import {ExternalTemplateSourceMapping, TemplateSourceMapping} from './api';

export interface SourceLocation {
  id: string;
  start: number;
  end: number;
}

/**
 * Adapter interface which allows the template type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to original locations in the template.
 */
export interface TcbSourceResolver {
  /**
   * For the given template id, retrieve the original source mapping which describes how the offsets
   * in the template should be interpreted.
   */
  getSourceMapping(id: string): TemplateSourceMapping;

  /**
   * Convert a location extracted from a TCB into a `ParseSourceSpan` if possible.
   */
  sourceLocationToSpan(location: SourceLocation): ParseSourceSpan|null;
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
export function addSourceId(tcb: ts.FunctionDeclaration, id: string): void {
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
    diagnostic: ts.Diagnostic, resolver: TcbSourceResolver): ts.Diagnostic|null {
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
  const span = resolver.sourceLocationToSpan(sourceLocation);
  if (span === null) {
    return null;
  }

  let messageText: string;
  if (typeof diagnostic.messageText === 'string') {
    messageText = diagnostic.messageText;
  } else {
    messageText = diagnostic.messageText.messageText;
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
    code: number, messageText: string | ts.DiagnosticMessageChain): ts.Diagnostic {
  if (mapping.type === 'direct') {
    // For direct mappings, the error is shown inline as ngtsc was able to pinpoint a string
    // constant within the `@Component` decorator for the template. This allows us to map the error
    // directly into the bytes of the source file.
    return {
      source: 'ngtsc',
      code,
      category,
      messageText,
      file: mapping.node.getSourceFile(),
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
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

    return {
      source: 'ngtsc',
      category,
      code,
      messageText,
      file: sf,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      // Show a secondary message indicating the component whose template contains the error.
      relatedInformation: [{
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: componentSf,
        // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
        // and getEnd() are used because they don't include surrounding whitespace.
        start: mapping.node.getStart(),
        length: mapping.node.getEnd() - mapping.node.getStart(),
        messageText: `Error occurs in the template of component ${componentName}.`,
      }],
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${(mapping as {type: string}).type}`);
  }
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

  const id =
      ts.forEachLeadingCommentRange(sourceFile.text, tcb.getFullStart(), (pos, end, kind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return null;
        }
        const commentText = sourceFile.text.substring(pos, end);
        return commentText.substring(2, commentText.length - 2);
      }) || null;
  if (id === null) {
    return null;
  }

  return {
    id,
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
