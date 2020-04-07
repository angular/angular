/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fromObject, generateMapFileComment, SourceMapConverter} from 'convert-source-map';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {absoluteFrom, absoluteFromSourceFile, basename, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';
import {RawSourceMap} from '../sourcemaps/raw_source_map';
import {SourceFileLoader} from '../sourcemaps/source_file_loader';

import {FileToWrite} from './utils';

export interface SourceMapInfo {
  source: string;
  map: SourceMapConverter|null;
  isInline: boolean;
}

/**
 * Merge the input and output source-maps, replacing the source-map comment in the output file
 * with an appropriate source-map comment pointing to the merged source-map.
 */
export function renderSourceAndMap(
    logger: Logger, fs: FileSystem, sourceFile: ts.SourceFile,
    generatedMagicString: MagicString): FileToWrite[] {
  const generatedPath = absoluteFromSourceFile(sourceFile);
  const generatedMapPath = absoluteFrom(`${generatedPath}.map`);
  const generatedContent = generatedMagicString.toString();
  const generatedMap: RawSourceMap = generatedMagicString.generateMap(
      {file: generatedPath, source: generatedPath, includeContent: true});

  try {
    const loader = new SourceFileLoader(fs, logger);
    const generatedFile = loader.loadSourceFile(
        generatedPath, generatedContent, {map: generatedMap, mapPath: generatedMapPath});

    const rawMergedMap: RawSourceMap = generatedFile.renderFlattenedSourceMap();
    const mergedMap = fromObject(rawMergedMap);
    if (generatedFile.sources[0]?.inline) {
      // The input source-map was inline so make the output one inline too.
      return [
        {path: generatedPath, contents: `${generatedFile.contents}\n${mergedMap.toComment()}`}
      ];
    } else {
      const sourceMapComment = generateMapFileComment(`${basename(generatedPath)}.map`);
      return [
        {path: generatedPath, contents: `${generatedFile.contents}\n${sourceMapComment}`},
        {path: generatedMapPath, contents: mergedMap.toJSON()}
      ];
    }
  } catch (e) {
    logger.error(`Error when flattening the source-map "${generatedMapPath}" for "${
        generatedPath}": ${e.toString()}`);
    return [
      {path: generatedPath, contents: generatedContent},
      {path: generatedMapPath, contents: fromObject(generatedMap).toJSON()},
    ];
  }
}
