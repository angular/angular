/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SourceMapConverter, commentRegex, fromJSON, fromObject, fromSource, generateMapFileComment, mapFileCommentRegex, removeComments, removeMapFileComments} from 'convert-source-map';
import MagicString from 'magic-string';
import {RawSourceMap, SourceMapConsumer, SourceMapGenerator} from 'source-map';
import * as ts from 'typescript';
import {resolve, FileSystem, absoluteFromSourceFile, dirname, basename, absoluteFrom} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';
import {FileToWrite} from './utils';

export interface SourceMapInfo {
  source: string;
  map: SourceMapConverter|null;
  isInline: boolean;
}

/**
 * Get the map from the source (note whether it is inline or external)
 */
export function extractSourceMap(
    fs: FileSystem, logger: Logger, file: ts.SourceFile): SourceMapInfo {
  const inline = commentRegex.test(file.text);
  const external = mapFileCommentRegex.exec(file.text);

  if (inline) {
    const inlineSourceMap = fromSource(file.text);
    return {
      source: removeComments(file.text).replace(/\n\n$/, '\n'),
      map: inlineSourceMap,
      isInline: true,
    };
  } else if (external) {
    let externalSourceMap: SourceMapConverter|null = null;
    try {
      const fileName = external[1] || external[2];
      const filePath = resolve(dirname(absoluteFromSourceFile(file)), fileName);
      const mappingFile = fs.readFile(filePath);
      externalSourceMap = fromJSON(mappingFile);
    } catch (e) {
      if (e.code === 'ENOENT') {
        logger.warn(
            `The external map file specified in the source code comment "${e.path}" was not found on the file system.`);
        const mapPath = absoluteFrom(file.fileName + '.map');
        if (basename(e.path) !== basename(mapPath) && fs.exists(mapPath) &&
            fs.stat(mapPath).isFile()) {
          logger.warn(
              `Guessing the map file name from the source file name: "${basename(mapPath)}"`);
          try {
            externalSourceMap = fromObject(JSON.parse(fs.readFile(mapPath)));
          } catch (e) {
            logger.error(e);
          }
        }
      }
    }
    return {
      source: removeMapFileComments(file.text).replace(/\n\n$/, '\n'),
      map: externalSourceMap,
      isInline: false,
    };
  } else {
    return {source: file.text, map: null, isInline: false};
  }
}

/**
 * Merge the input and output source-maps, replacing the source-map comment in the output file
 * with an appropriate source-map comment pointing to the merged source-map.
 */
export function renderSourceAndMap(
    sourceFile: ts.SourceFile, input: SourceMapInfo, output: MagicString): FileToWrite[] {
  const outputPath = absoluteFromSourceFile(sourceFile);
  const outputMapPath = absoluteFrom(`${outputPath}.map`);
  const relativeSourcePath = basename(outputPath);
  const relativeMapPath = `${relativeSourcePath}.map`;

  const outputMap = output.generateMap({
    source: outputPath,
    includeContent: true,
    // hires: true // TODO: This results in accurate but huge sourcemaps. Instead we should fix
    // the merge algorithm.
  });

  // we must set this after generation as magic string does "manipulation" on the path
  outputMap.file = relativeSourcePath;

  const mergedMap =
      mergeSourceMaps(input.map && input.map.toObject(), JSON.parse(outputMap.toString()));

  const result: FileToWrite[] = [];
  if (input.isInline) {
    result.push({path: outputPath, contents: `${output.toString()}\n${mergedMap.toComment()}`});
  } else {
    result.push({
      path: outputPath,
      contents: `${output.toString()}\n${generateMapFileComment(relativeMapPath)}`
    });
    result.push({path: outputMapPath, contents: mergedMap.toJSON()});
  }
  return result;
}


/**
 * Merge the two specified source-maps into a single source-map that hides the intermediate
 * source-map.
 * E.g. Consider these mappings:
 *
 * ```
 * OLD_SRC -> OLD_MAP -> INTERMEDIATE_SRC -> NEW_MAP -> NEW_SRC
 * ```
 *
 * this will be replaced with:
 *
 * ```
 * OLD_SRC -> MERGED_MAP -> NEW_SRC
 * ```
 */
export function mergeSourceMaps(
    oldMap: RawSourceMap | null, newMap: RawSourceMap): SourceMapConverter {
  if (!oldMap) {
    return fromObject(newMap);
  }
  const oldMapConsumer = new SourceMapConsumer(oldMap);
  const newMapConsumer = new SourceMapConsumer(newMap);
  const mergedMapGenerator = SourceMapGenerator.fromSourceMap(newMapConsumer);
  mergedMapGenerator.applySourceMap(oldMapConsumer);
  const merged = fromJSON(mergedMapGenerator.toString());
  return merged;
}
