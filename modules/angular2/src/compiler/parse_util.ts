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
    if (ctxStart > source.length - 1) {
      ctxStart = source.length - 1;
    }
    var ctxEnd = ctxStart;
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

    let context = source.substring(ctxStart, this.location.offset) + '[ERROR ->]' +
                  source.substring(this.location.offset, ctxEnd + 1);

    return `${this.msg} ("${context}"): ${this.location}`;
  }
}

export class ParseSourceSpan {
  constructor(public start: ParseLocation, public end: ParseLocation) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}
