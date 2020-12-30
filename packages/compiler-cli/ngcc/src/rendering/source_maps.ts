/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fromObject, generateMapFileComment, SourceMapConverter} from 'convert-source-map';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {absoluteFrom, absoluteFromSourceFile, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {RawSourceMap, SourceFileLoader} from '../../../src/ngtsc/sourcemaps';

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
    logger: Logger, fs: ReadonlyFileSystem, sourceFile: ts.SourceFile,
    generatedMagicString: MagicString): FileToWrite[] {
  const generatedPath = absoluteFromSourceFile(sourceFile);
  const generatedMapPath = absoluteFrom(`${generatedPath}.map`);
  const generatedContent = generatedMagicString.toString();
  const generatedMap: RawSourceMap = generatedMagicString.generateMap(
      {file: generatedPath, source: generatedPath, includeContent: true});

  try {
    const loader = new SourceFileLoader(fs, logger, {});
    const generatedFile = loader.loadSourceFile(
        generatedPath, generatedContent, {map: generatedMap, mapPath: generatedMapPath});

    const rawMergedMap: RawSourceMap = generatedFile.renderFlattenedSourceMap();
    const mergedMap = fromObject(rawMergedMap);
    const firstSource = generatedFile.sources[0];
    if (firstSource && (firstSource.rawMap !== null || !sourceFile.isDeclarationFile) &&
        firstSource.inline) {
      // We render an inline source map if one of:
      // * there was no input source map and this is not a typings file;
      // * the input source map exists and was inline.
      //
      // We do not generate inline source maps for typings files unless there explicitly was one in
      // the input file because these inline source maps can be very large and it impacts on the
      // performance of IDEs that need to read them to provide intellisense etc.
      return [
        {path: generatedPath, contents: `${generatedFile.contents}\n${mergedMap.toComment()}`}
      ];
    } else {
      const sourceMapComment = generateMapFileComment(`${fs.basename(generatedPath)}.map`);
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
