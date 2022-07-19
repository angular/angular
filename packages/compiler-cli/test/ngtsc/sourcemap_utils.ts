/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {MappingItem, RawSourceMap, SourceMapConsumer} from 'source-map';

import {NgtscTestEnvironment} from './env';

class TestSourceFile {
  private lineStarts: number[];

  constructor(public url: string, public contents: string) {
    this.lineStarts = this.getLineStarts();
  }

  getSegment(key: 'generated'|'original', start: MappingItem|any, end: MappingItem|any): string {
    const startLine = start[key + 'Line'];
    const startCol = start[key + 'Column'];
    const endLine = end[key + 'Line'];
    const endCol = end[key + 'Column'];
    return this.contents.substring(
        this.lineStarts[startLine - 1] + startCol, this.lineStarts[endLine - 1] + endCol);
  }

  getSourceMapFileName(generatedContents: string): string {
    const match = /\/\/# sourceMappingURL=(.+)/.exec(generatedContents);
    if (!match) {
      throw new Error('Generated contents does not contain a sourceMappingURL');
    }
    return match[1];
  }

  private getLineStarts(): number[] {
    const lineStarts = [0];
    let currentPos = 0;
    const lines = this.contents.split('\n');
    lines.forEach(line => {
      currentPos += line.length + 1;
      lineStarts.push(currentPos);
    });
    return lineStarts;
  }
}

/**
 * A mapping of a segment of generated text to a segment of source text.
 */
export interface SegmentMapping {
  /** The generated text in this segment. */
  generated: string;
  /** The source text in this segment. */
  source: string;
  /** The URL of the source file for this segment. */
  sourceUrl: string;
}

/**
 * Process a generated file to extract human understandable segment mappings.
 * These mappings are easier to compare in unit tests that the raw SourceMap mappings.
 * @param env the environment that holds the source and generated files.
 * @param generatedFileName The name of the generated file to process.
 * @returns An array of segment mappings for each mapped segment in the given generated file.
 */
export async function getMappedSegments(
    env: NgtscTestEnvironment, generatedFileName: string): Promise<SegmentMapping[]> {
  const generated = new TestSourceFile(generatedFileName, env.getContents(generatedFileName));
  const sourceMapFileName = generated.getSourceMapFileName(generated.contents);

  const sources = new Map<string, TestSourceFile>();
  const mappings: MappingItem[] = [];

  const mapContents = env.getContents(sourceMapFileName);
  const sourceMapConsumer = await new SourceMapConsumer(JSON.parse(mapContents) as RawSourceMap);
  sourceMapConsumer.eachMapping(item => {
    if (!sources.has(item.source)) {
      sources.set(item.source, new TestSourceFile(item.source, env.getContents(item.source)));
    }
    mappings.push(item);
  });

  const segments: SegmentMapping[] = [];
  let currentMapping = mappings.shift();
  while (currentMapping) {
    const nextMapping = mappings.shift();
    if (nextMapping) {
      const source = sources.get(currentMapping.source)!;
      const segment = {
        generated: generated.getSegment('generated', currentMapping, nextMapping),
        source: source.getSegment('original', currentMapping, nextMapping),
        sourceUrl: source.url
      };
      if (segment.generated !== segment.source) {
        segments.push(segment);
      }
    }
    currentMapping = nextMapping;
  }

  return segments;
}
