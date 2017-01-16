/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as chars from './chars';
import {isPresent} from './facade/lang';

export class ParseLocation {
  constructor(
      public file: ParseSourceFile, public offset: number, public line: number,
      public col: number) {}

  toString(): string {
    return isPresent(this.offset) ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
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
        const priorLine = source.substr(0, offset - 1).lastIndexOf(String.fromCharCode(chars.$LF));
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
}

export class ParseSourceFile {
  constructor(public content: string, public url: string) {}
}

export class ParseSourceSpan {
  constructor(
      public start: ParseLocation, public end: ParseLocation, public details: string = null) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}

export enum ParseErrorLevel {
  WARNING,
  FATAL
}

export class ParseError {
  constructor(
      public span: ParseSourceSpan, public msg: string,
      public level: ParseErrorLevel = ParseErrorLevel.FATAL) {}

  toString(): string {
    const source = this.span.start.file.content;
    let ctxStart = this.span.start.offset;
    let contextStr = '';
    let details = '';
    if (isPresent(ctxStart)) {
      if (ctxStart > source.length - 1) {
        ctxStart = source.length - 1;
      }
      let ctxEnd = ctxStart;
      let ctxLen = 0;
      let ctxLines = 0;

      while (ctxLen < 100 && ctxStart > 0) {
        ctxStart--;
        ctxLen++;
        if (source[ctxStart] == '\n') {
          if (++ctxLines == 3) {
            break;
          }
        }
      }

      ctxLen = 0;
      ctxLines = 0;
      while (ctxLen < 100 && ctxEnd < source.length - 1) {
        ctxEnd++;
        ctxLen++;
        if (source[ctxEnd] == '\n') {
          if (++ctxLines == 3) {
            break;
          }
        }
      }

      const context = source.substring(ctxStart, this.span.start.offset) + '[ERROR ->]' +
          source.substring(this.span.start.offset, ctxEnd + 1);
      contextStr = ` ("${context}")`;
    }
    if (this.span.details) {
      details = `, ${this.span.details}`;
    }
    return `${this.msg}${contextStr}: ${this.span.start}${details}`;
  }
}
