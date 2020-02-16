/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SourceMapConverter, fromObject, generateMapFileComment} from 'convert-source-map';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {FileSystem, absoluteFromSourceFile, basename, absoluteFrom} from '../../../src/ngtsc/file_system';
import {FileToWrite} from './utils';
import {SourceFileLoader} from '../sourcemaps/source_file_loader';
import {RawSourceMap} from '../sourcemaps/raw_source_map';

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
    fs: FileSystem, sourceFile: ts.SourceFile, generatedMagicString: MagicString): FileToWrite[] {
  const generatedPath = absoluteFromSourceFile(sourceFile);
  const generatedMapPath = absoluteFrom(`${generatedPath}.map`);
  const generatedContent = generatedMagicString.toString();
  const generatedMap: RawSourceMap = generatedMagicString.generateMap(
      {file: generatedPath, source: generatedPath, includeContent: true});

  const loader = new SourceFileLoader(fs);
  const generatedFile = loader.loadSourceFile(
      generatedPath, generatedContent, {map: generatedMap, mapPath: generatedMapPath});

  const rawMergedMap: RawSourceMap = generatedFile.renderFlattenedSourceMap();
  const mergedMap = fromObject(rawMergedMap);

  if (generatedFile.sources[0]?.inline) {
    // The input source-map was inline so make the output one inline too.
    return [{path: generatedPath, contents: `${generatedFile.contents}\n${mergedMap.toComment()}`}];
  } else {
    const sourceMapComment = generateMapFileComment(`${basename(generatedPath)}.map`);
    return [
      {path: generatedPath, contents: `${generatedFile.contents}\n${sourceMapComment}`},
      {path: generatedMapPath, contents: mergedMap.toJSON()}
    ];
  }
}
