/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {basename, dirname, resolve} from 'path';
import {MappingItem, SourceMapConsumer} from 'source-map';
import {FileUtils} from '../../../src/file_utils';

export function getSourceMap(generatedFilePath: string) {
  const generatedSource = new SourceFile(FileUtils.readFile(generatedFilePath), generatedFilePath);
  return new SourceMap(generatedSource);
}

export class SourceMap {
  public originalSources = new Map<string, SourceFile>();
  private map = this.loadSourceMap(this.generatedSource.basePath, this.generatedSource.contents);
  private mappings = this.getMappings(this.map);

  constructor(public generatedSource: SourceFile) {
    this.mappings.forEach(m => {
      if (!this.originalSources.has(m.source)) {
        const content = this.map.sourceContentFor(m.source) ||
            FileUtils.readFile(resolve(this.generatedSource.basePath, m.source));
        const originalSource = new SourceFile(content, resolve(generatedSource.basePath, m.source));
        this.originalSources.set(m.source, originalSource);
      }
    });
  }

  getMappedSegments(): [string, string][] {
    return this.mappings.map((_, i) => [this.getOriginalText(i), this.getGeneratedText(i)]);
  }

  // dumpMappings(): void {
  //   console.log(`Generated file: ${basename(this.generatedSource.sourcePath)}`);
  //   console.log(this.generatedSource.contents);
  //   console.log('==============\n');

  //   this.originalSources.forEach(source => {
  //     console.log(`Source file: ${basename(source.sourcePath)}`);
  //     console.log(source.contents);
  //     console.log('==============\n');
  //   });

  //   this.mappings.forEach(
  //       (m, i) => console.log(
  //           pad(`${m.originalLine}:${m.originalColumn} =>
  //           ${m.generatedLine}:${m.generatedColumn}`,
  //               16) +
  //           `(${m.source}) ${pad(this.getOriginalText(i), 40)}` +
  //           ` => ` + this.getGeneratedText(i)));
  // }

  private getGeneratedText(segment: number): string {
    const start = this.mappings[segment];
    let end: MappingItem|undefined = this.mappings[segment + 1];
    if (end &&
        (end.generatedLine < start.generatedLine ||
         end.generatedLine === start.generatedLine && end.generatedColumn < start.generatedLine)) {
      end = start;
    }
    return this.generatedSource.getSegment(
        start.generatedLine, start.generatedColumn, end && end.generatedLine,
        end && end.generatedColumn);
  }

  private getOriginalText(segment: number): string {
    const start = this.mappings[segment];
    let end: MappingItem|undefined = undefined;
    // Find the next end mapping that has a original position that in the same source and is after
    // this one
    do {
      segment++;
      end = this.mappings[segment];
    } while (
        // Not run out of segments
        end &&
        (
            // Next segment not in the same source file as the start segment
            end.source !== start.source ||
            // Next segment on an earlier line than the start segment
            end.originalLine < start.originalLine ||
            // Next segment on the same line but an earlier column than the start segment
            end.originalLine === start.originalLine && end.originalColumn < start.originalLine));
    const originalSource = this.originalSources.get(start.source) !;
    return originalSource.getSegment(
        start.originalLine, start.originalColumn, end && end.originalLine,
        end && end.originalColumn);
  }

  private loadSourceMap(basePath: string, contents: string): SourceMapConsumer {
    const lastLineIndex = contents.trimRight().lastIndexOf('\n');
    const lastLine = contents.substring(lastLineIndex + 1);
    const sourceMapMatch =
        /^\/\/[#@]\s+sourceMappingURL=(.+)$|^\/\*[#@]\s+sourceMappingURL=(.*)\s*\*\/$/.exec(
            lastLine);
    if (sourceMapMatch) {
      const sourceMapPath = sourceMapMatch[1] || sourceMapMatch[2];
      const dataUrlMatch =
          /data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(.*)/.exec(sourceMapPath);
      if (dataUrlMatch) {
        return new SourceMapConsumer(JSON.parse(Buffer.from(dataUrlMatch[1], 'base64').toString()));
      } else {
        return new SourceMapConsumer(
            JSON.parse(FileUtils.readFile(resolve(basePath, sourceMapPath))));
      }
    }
    throw new Error('Generated contents does not contain a valid sourceMappingURL');
  }

  private getMappings(sourceMap: SourceMapConsumer): MappingItem[] {
    const mappings: MappingItem[] = [];
    sourceMap.eachMapping(m => {
      if (typeof m.originalLine === 'number' && typeof m.originalColumn === 'number') {
        mappings.push(m);
      }
    });
    return mappings;
  }
}

export class SourceFile {
  public basePath = dirname(this.sourcePath);
  public lineStarts = this.getLineStarts();
  constructor(public contents: string, public sourcePath: string) {}

  getSegment(
      startLine: number, startCol: number, endLine: number|undefined,
      endCol: number|undefined): string {
    return this.contents
        .substring(
            this.lineStarts[startLine - 1] + startCol,
            endLine !== undefined && endCol !== undefined ?
                (this.lineStarts[endLine - 1] + endCol) :
                undefined)
        .replace(/\n/g, '\\n');
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

function pad(value: string, width: number) {
  let padding = width < value.length ? 0 : width - value.length;
  return value + ' '.repeat(padding);
}
