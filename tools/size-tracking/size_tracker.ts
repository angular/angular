/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {dirname} from 'path';
import {SourceMapConsumer} from 'source-map';

import {FileSizeData, sortFileSizeData} from './file_size_data';

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
    this.consumer = new SourceMapConsumer(JSON.parse(readFileSync(sourceMapPath, 'utf8')));
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
      files: {},
      directories: {},
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

        if (!source) {
          result.unmapped += 1;
        } else {
          source = this._resolveMappedPath(source);
          result.files[source] = (result.files[source] || 0) + 1;
        }
      }
    }

    Object.keys(result.files).forEach(filePath => {
      const pathSegments = [];
      const fileSize = result.files[filePath];
      for (let pathSegment of dirname(filePath).split('/')) {
        pathSegments.push(pathSegment);
        const name = pathSegments.join('/');
        result.directories[name] = (result.directories[name] || 0) + fileSize;
      }
    });

    return sortFileSizeData(result);
  }

  private _resolveMappedPath(filePath: string): string {
    // We only want to store POSIX-like paths in order to avoid path
    // separator failures when running the golden tests on Windows.
    filePath = filePath.replace(/\\/g, '/');

    // Workaround for https://github.com/angular/angular/issues/30060
    if (process.env['BAZEL_TARGET'].includes('test/bundling/core_all:size_test')) {
      return filePath.replace(/^(\.\.\/)+external/, 'external')
          .replace(/^(\.\.\/)+packages\/core\//, '')
          .replace(/^(\.\.\/){3}/, '');
    }

    return filePath;
  }
}
