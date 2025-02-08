/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as chars from './chars';
import {stringify} from './util';

export class ParseLocation {
  constructor(
    public file: ParseSourceFile,
    public offset: number,
    public line: number,
    public col: number,
  ) {}

  toString(): string {
    return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
  }

  moveBy(delta: number): ParseLocation {
    const source = this.file.content;
    const len = source.length;
    let offset = this.offset;
    let line = this.line;
    let col = this.col;
    while (offset > 0 && delta < 0) {
      offset--;
      delta++;
      const ch = source.charCodeAt(offset);
      if (ch == chars.$LF) {
        line--;
        const priorLine = source
          .substring(0, offset - 1)
          .lastIndexOf(String.fromCharCode(chars.$LF));
        col = priorLine > 0 ? offset - priorLine : offset;
      } else {
        col--;
      }
    }
    while (offset < len && delta > 0) {
      const ch = source.charCodeAt(offset);
      offset++;
      delta--;
      if (ch == chars.$LF) {
        line++;
        col = 0;
      } else {
        col++;
      }
    }
    return new ParseLocation(this.file, offset, line, col);
  }

  // Return the source around the location
  // Up to `maxChars` or `maxLines` on each side of the location
  getContext(maxChars: number, maxLines: number): {before: string; after: string} | null {
    const content = this.file.content;
    let startOffset = this.offset;

    if (startOffset != null) {
      if (startOffset > content.length - 1) {
        startOffset = content.length - 1;
      }
      let endOffset = startOffset;
      let ctxChars = 0;
      let ctxLines = 0;

      while (ctxChars < maxChars && startOffset > 0) {
        startOffset--;
        ctxChars++;
        if (content[startOffset] == '\n') {
          if (++ctxLines == maxLines) {
            break;
          }
        }
      }

      ctxChars = 0;
      ctxLines = 0;
      while (ctxChars < maxChars && endOffset < content.length - 1) {
        endOffset++;
        ctxChars++;
        if (content[endOffset] == '\n') {
          if (++ctxLines == maxLines) {
            break;
          }
        }
      }

      return {
        before: content.substring(startOffset, this.offset),
        after: content.substring(this.offset, endOffset + 1),
      };
    }

    return null;
  }
}

export class ParseSourceFile {
  constructor(
    public content: string,
    public url: string,
  ) {}
}

export class ParseSourceSpan {
  /**
   * Create an object that holds information about spans of tokens/nodes captured during
   * lexing/parsing of text.
   *
   * @param start
   * The location of the start of the span (having skipped leading trivia).
   * Skipping leading trivia makes source-spans more "user friendly", since things like HTML
   * elements will appear to begin at the start of the opening tag, rather than at the start of any
   * leading trivia, which could include newlines.
   *
   * @param end
   * The location of the end of the span.
   *
   * @param fullStart
   * The start of the token without skipping the leading trivia.
   * This is used by tooling that splits tokens further, such as extracting Angular interpolations
   * from text tokens. Such tooling creates new source-spans relative to the original token's
   * source-span. If leading trivia characters have been skipped then the new source-spans may be
   * incorrectly offset.
   *
   * @param details
   * Additional information (such as identifier names) that should be associated with the span.
   */
  constructor(
    public start: ParseLocation,
    public end: ParseLocation,
    public fullStart: ParseLocation = start,
    public details: string | null = null,
  ) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}

export enum ParseErrorLevel {
  WARNING,
  ERROR,
}

export class ParseError {
  constructor(
    /** Location of the error. */
    readonly span: ParseSourceSpan,
    /** Error message. */
    readonly msg: string,
    /** Severity level of the error. */
    readonly level: ParseErrorLevel = ParseErrorLevel.ERROR,
    /**
     * Error that caused the error to be surfaced. For example, an error in a sub-expression that
     * couldn't be parsed. Not guaranteed to be defined, but can be used to provide more context.
     */
    readonly relatedError?: unknown,
  ) {}

  contextualMessage(): string {
    const ctx = this.span.start.getContext(100, 3);
    return ctx
      ? `${this.msg} ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")`
      : this.msg;
  }

  toString(): string {
    const details = this.span.details ? `, ${this.span.details}` : '';
    return `${this.contextualMessage()}: ${this.span.start}${details}`;
  }
}

/**
 * Generates Source Span object for a given R3 Type for JIT mode.
 *
 * @param kind Component or Directive.
 * @param typeName name of the Component or Directive.
 * @param sourceUrl reference to Component or Directive source.
 * @returns instance of ParseSourceSpan that represent a given Component or Directive.
 */
export function r3JitTypeSourceSpan(
  kind: string,
  typeName: string,
  sourceUrl: string,
): ParseSourceSpan {
  const sourceFileName = `in ${kind} ${typeName} in ${sourceUrl}`;
  const sourceFile = new ParseSourceFile('', sourceFileName);
  return new ParseSourceSpan(
    new ParseLocation(sourceFile, -1, -1, -1),
    new ParseLocation(sourceFile, -1, -1, -1),
  );
}

let _anonymousTypeIndex = 0;

export function identifierName(
  compileIdentifier: CompileIdentifierMetadata | null | undefined,
): string | null {
  if (!compileIdentifier || !compileIdentifier.reference) {
    return null;
  }
  const ref = compileIdentifier.reference;
  if (ref['__anonymousType']) {
    return ref['__anonymousType'];
  }
  if (ref['__forward_ref__']) {
    // We do not want to try to stringify a `forwardRef()` function because that would cause the
    // inner function to be evaluated too early, defeating the whole point of the `forwardRef`.
    return '__forward_ref__';
  }
  let identifier = stringify(ref);
  if (identifier.indexOf('(') >= 0) {
    // case: anonymous functions!
    identifier = `anonymous_${_anonymousTypeIndex++}`;
    ref['__anonymousType'] = identifier;
  } else {
    identifier = sanitizeIdentifier(identifier);
  }
  return identifier;
}

export interface CompileIdentifierMetadata {
  reference: any;
}

export function sanitizeIdentifier(name: string): string {
  return name.replace(/\W/g, '_');
}
