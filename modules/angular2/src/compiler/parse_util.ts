import {Math} from 'angular2/src/facade/math';

export class ParseLocation {
  constructor(public file: ParseSourceFile, public offset: number, public line: number,
              public col: number) {}

  toString() { return `${this.file.url}@${this.line}:${this.col}`; }
}

export class ParseSourceFile {
  constructor(public content: string, public url: string) {}
}

export abstract class ParseError {
  constructor(public location: ParseLocation, public msg: string) {}

  toString(): string {
    var source = this.location.file.content;
    var ctxStart = Math.max(this.location.offset - 10, 0);
    var ctxEnd = Math.min(this.location.offset + 10, source.length);
    return `${this.msg} (${source.substring(ctxStart, ctxEnd)}): ${this.location}`;
  }
}

export class ParseSourceSpan {
  constructor(public start: ParseLocation, public end: ParseLocation) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}
