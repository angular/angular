/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {utf8Encode} from '../util';

// https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
const VERSION = 3;

const JS_B64_PREFIX = '# sourceMappingURL=data:application/json;base64,';

type Segment = {
  col0: number,
  sourceUrl?: string,
  sourceLine0?: number,
  sourceCol0?: number,
};

export type SourceMap = {
  version: number,
  file?: string,
      sourceRoot: string,
      sources: string[],
      sourcesContent: (string|null)[],
      mappings: string,
};

export class SourceMapGenerator {
  private sourcesContent: Map<string, string|null> = new Map();
  private lines: Segment[][] = [];
  private lastCol0: number = 0;
  private hasMappings = false;

  constructor(private file: string|null = null) {}

  // The content is `null` when the content is expected to be loaded using the URL
  addSource(url: string, content: string|null = null): this {
    if (!this.sourcesContent.has(url)) {
      this.sourcesContent.set(url, content);
    }
    return this;
  }

  addLine(): this {
    this.lines.push([]);
    this.lastCol0 = 0;
    return this;
  }

  addMapping(col0: number, sourceUrl?: string, sourceLine0?: number, sourceCol0?: number): this {
    if (!this.currentLine) {
      throw new Error(`A line must be added before mappings can be added`);
    }
    if (sourceUrl != null && !this.sourcesContent.has(sourceUrl)) {
      throw new Error(`Unknown source file "${sourceUrl}"`);
    }
    if (col0 == null) {
      throw new Error(`The column in the generated code must be provided`);
    }
    if (col0 < this.lastCol0) {
      throw new Error(`Mapping should be added in output order`);
    }
    if (sourceUrl && (sourceLine0 == null || sourceCol0 == null)) {
      throw new Error(`The source location must be provided when a source url is provided`);
    }

    this.hasMappings = true;
    this.lastCol0 = col0;
    this.currentLine.push({col0, sourceUrl, sourceLine0, sourceCol0});
    return this;
  }

  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  private get currentLine(): Segment[]|null {
    return this.lines.slice(-1)[0];
  }

  toJSON(): SourceMap|null {
    if (!this.hasMappings) {
      return null;
    }

    const sourcesIndex = new Map<string, number>();
    const sources: string[] = [];
    const sourcesContent: (string|null)[] = [];

    Array.from(this.sourcesContent.keys()).forEach((url: string, i: number) => {
      sourcesIndex.set(url, i);
      sources.push(url);
      sourcesContent.push(this.sourcesContent.get(url) || null);
    });

    let mappings: string = '';
    let lastCol0: number = 0;
    let lastSourceIndex: number = 0;
    let lastSourceLine0: number = 0;
    let lastSourceCol0: number = 0;

    this.lines.forEach(segments => {
      lastCol0 = 0;

      mappings += segments
                      .map(segment => {
                        // zero-based starting column of the line in the generated code
                        let segAsStr = toBase64VLQ(segment.col0 - lastCol0);
                        lastCol0 = segment.col0;

                        if (segment.sourceUrl != null) {
                          // zero-based index into the “sources” list
                          segAsStr +=
                              toBase64VLQ(sourcesIndex.get(segment.sourceUrl)! - lastSourceIndex);
                          lastSourceIndex = sourcesIndex.get(segment.sourceUrl)!;
                          // the zero-based starting line in the original source
                          segAsStr += toBase64VLQ(segment.sourceLine0! - lastSourceLine0);
                          lastSourceLine0 = segment.sourceLine0!;
                          // the zero-based starting column in the original source
                          segAsStr += toBase64VLQ(segment.sourceCol0! - lastSourceCol0);
                          lastSourceCol0 = segment.sourceCol0!;
                        }

                        return segAsStr;
                      })
                      .join(',');
      mappings += ';';
    });

    mappings = mappings.slice(0, -1);

    return {
      'file': this.file || '',
      'version': VERSION,
      'sourceRoot': '',
      'sources': sources,
      'sourcesContent': sourcesContent,
      'mappings': mappings,
    };
  }

  toJsComment(): string {
    return this.hasMappings ? '//' + JS_B64_PREFIX + toBase64String(JSON.stringify(this, null, 0)) :
                              '';
  }
}

export function toBase64String(value: string): string {
  let b64 = '';
  const encoded = utf8Encode(value);
  for (let i = 0; i < encoded.length;) {
    const i1 = encoded[i++];
    const i2 = i < encoded.length ? encoded[i++] : null;
    const i3 = i < encoded.length ? encoded[i++] : null;
    b64 += toBase64Digit(i1 >> 2);
    b64 += toBase64Digit(((i1 & 3) << 4) | (i2 === null ? 0 : i2 >> 4));
    b64 += i2 === null ? '=' : toBase64Digit(((i2 & 15) << 2) | (i3 === null ? 0 : i3 >> 6));
    b64 += i2 === null || i3 === null ? '=' : toBase64Digit(i3 & 63);
  }

  return b64;
}

function toBase64VLQ(value: number): string {
  value = value < 0 ? ((-value) << 1) + 1 : value << 1;

  let out = '';
  do {
    let digit = value & 31;
    value = value >> 5;
    if (value > 0) {
      digit = digit | 32;
    }
    out += toBase64Digit(digit);
  } while (value > 0);

  return out;
}

const B64_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64Digit(value: number): string {
  if (value < 0 || value >= 64) {
    throw new Error(`Can only encode value in the range [0, 63]`);
  }

  return B64_DIGITS[value];
}
