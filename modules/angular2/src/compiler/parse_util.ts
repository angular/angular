export class ParseLocation {
  constructor(public file: ParseSourceFile, public offset: number, public line: number,
              public col: number) {}

  toString(): string { return `${this.file.url}@${this.line}:${this.col}`; }
}

export class ParseSourceFile {
  constructor(public content: string, public url: string) {}
}

export abstract class ParseError {
  constructor(public location: ParseLocation, public msg: string) {}

  toString(): string {
    var source = this.location.file.content;
    var ctxStart = this.location.offset;
    var ctxEnd = this.location.offset;
    var ctxLen = 0;
    var ctxLines = 0;

    while (ctxLen < 100 && ctxStart > 0) {
      ctxStart--;
      ctxLen++;
      if (source[ctxStart] == "\n") {
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
      if (source[ctxEnd] == "\n") {
        if (++ctxLines == 3) {
          break;
        }
      }
    }
    return `${this.msg} ("${source.substring(ctxStart, ctxEnd + 1)}"): ${this.location}`;
  }
}

export class ParseSourceSpan {
  constructor(public start: ParseLocation, public end: ParseLocation) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}
