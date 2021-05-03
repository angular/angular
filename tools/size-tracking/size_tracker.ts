/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {RawSourceMap, SourceMapConsumer} from 'source-map';

import {DirectorySizeEntry, FileSizeData, omitCommonPathPrefix, sortFileSizeData} from './file_size_data';

export class SizeTracker {
  private fileContent: string;
  private consumer: SourceMapConsumer;

  /**
   * Retraced size result that can be used to inspect where bytes in the input file
   * originated from and how much each file contributes to the input file.
   */
  readonly sizeResult: FileSizeData;

  constructor(private filePath: string, private sourceMapPath: string) {
    this.fileContent = readFileSync(filePath, 'utf8');
    this.consumer =
        new SourceMapConsumer(JSON.parse(readFileSync(sourceMapPath, 'utf8')) as RawSourceMap);
    this.sizeResult = this._computeSizeResult();
  }

  /**
   * Computes the file size data by analyzing the input file through the specified
   * source-map.
   */
  private _computeSizeResult(): FileSizeData {
    const lines = this.fileContent.split(/(\r?\n)/);
    const result: FileSizeData = {
      unmapped: 0,
      files: {size: 0},
    };

    // Walk through the columns for each line in the input file and find the
    // origin source-file of the given character. This allows us to inspect
    // how the given input file is composed and how much each individual file
    // contributes to the overall bundle file.
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineText = lines[lineIdx];
      for (let colIdx = 0; colIdx < lineText.length; colIdx++) {
        // Note that the "originalPositionFor" line number is one-based.
        let {source} = this.consumer.originalPositionFor({line: lineIdx + 1, column: colIdx});

        // Increase the amount of total bytes.
        result.files.size += 1;

        if (!source) {
          result.unmapped += 1;
          continue;
        }

        const pathSegments = this._resolveMappedPath(source).split('/');
        let currentEntry = result.files;

        // Walk through each path segment and update the size entries with
        // new size. This makes it possibly to create na hierarchical tree
        // that matches the actual file system.
        pathSegments.forEach((segmentName, index) => {
          // The last segment always refers to a file and we therefore can
          // store the size verbatim as property value.
          if (index === pathSegments.length - 1) {
            currentEntry[segmentName] = (<number>currentEntry[segmentName] || 0) + 1;
          } else {
            // Append a trailing slash to the segment so that it
            // is clear that this size entry represents a folder.
            segmentName = `${segmentName}/`;
            const newEntry = <DirectorySizeEntry>currentEntry[segmentName] || {size: 0};
            newEntry.size += 1;
            currentEntry = currentEntry[segmentName] = newEntry;
          }
        });
      }
    }

    // Omit size entries which are not needed and just bloat up the file
    // size data. e.g. if all paths start with "../../", we want to omit
    // this prefix to make the size data less confusing.
    result.files = omitCommonPathPrefix(result.files);

    return sortFileSizeData(result);
  }

  private _resolveMappedPath(filePath: string): string {
    // We only want to store POSIX-like paths in order to avoid path
    // separator failures when running the golden tests on Windows.
    filePath = filePath.replace(/\\/g, '/');

    // Workaround for https://github.com/angular/angular/issues/30060
    if (process.env['BAZEL_TARGET'].includes('test/bundling/core_all:size_test')) {
      return filePath.replace(/^(\.\.\/)+external/, 'external')
          .replace(/^(\.\.\/)+packages\/core\//, '@angular/core/')
          .replace(/^(\.\.\/){3}/, '@angular/core/');
    }

    return filePath;
  }
}
