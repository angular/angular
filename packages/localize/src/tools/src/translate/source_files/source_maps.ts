/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {commentRegex, fromComment, fromObject, mapFileCommentRegex} from 'convert-source-map';
import * as fs from 'fs';
import {basename, dirname, resolve} from 'path';

import {Diagnostics} from '../../diagnostics';
import {FileUtils} from '../../file_utils';
import {SourceMapStrategy} from './source_file_utils';

export type SourceMapType = 'external' | 'inline' | 'hidden' | 'none';

export interface SourceMapInfo {
  source: string;
  map: object|undefined;
  type: SourceMapType;
}

/**
 * Get the map from the source (note whether it is inline or external)
 */
export function extractSourceMap(
    diagnostics: Diagnostics, sourceFilePath: string, sourceCode: string): SourceMapInfo {
  // Only look at the last line of the file for the sourceMappingURL, since it is possible that
  // there are other spurious ones earlier on in the file.
  const lastSourceLineIndex = sourceCode.trimRight().lastIndexOf('\n');
  const lastSourceLine = sourceCode.substring(lastSourceLineIndex);

  const inline = commentRegex.test(lastSourceLine);
  if (inline) {
    const inlineSourceMap = fromComment(lastSourceLine);
    if (inlineSourceMap !== null) {
      return {
        source: sourceCode.substring(0, lastSourceLineIndex),
        map: inlineSourceMap.toObject(),
        type: 'inline',
      };
    }
  }

  const external = mapFileCommentRegex.exec(lastSourceLine);
  if (external) {
    let externalSourceMap: object|undefined = undefined;
    let type: SourceMapType = 'external';
    try {
      const fileName = external[1] || external[2];
      const filePath = resolve(dirname(sourceFilePath), fileName);
      const mappingFile = fs.readFileSync(filePath, 'utf8');
      externalSourceMap = JSON.parse(mappingFile);
    } catch (e) {
      if (e.code === 'ENOENT') {
        diagnostics.warn(
            `The external map file specified in the source code comment "${e.path}" was not found on the file system.`);
        const mapPath = sourceFilePath + '.map';
        if (basename(e.path) !== basename(mapPath) && fs.existsSync(mapPath) &&
            fs.statSync(mapPath).isFile()) {
          diagnostics.warn(
              `Guessing the map file name from the source file name: "${basename(mapPath)}"`);
          try {
            externalSourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
            type = 'hidden';
          } catch (e) {
            type = 'none';
            diagnostics.error(e.message);
          }
        }
      }
    }
    return {
      source: sourceCode.substring(0, lastSourceLineIndex),
      map: externalSourceMap, type,
    };
  }

  return {source: sourceCode, map: undefined, type: 'none'};
}

/**
 * Write the source file and its associated source-map.
 *
 * The source-map will either be inlined into the source file or it will be stored as a `.map` file
 * alongside the source file.
 * Either way, the source file will be updated with a `sourceMappingsURL` comment to wire it up.
 */
export function writeFileAndSourceMap(
    translatedFilePath: string, translatedCode: string, translatedSourceMapObj: object,
    type: SourceMapType): void {
  const mergedSourceMap = fromObject(translatedSourceMapObj);
  if (type === 'inline') {
    FileUtils.writeFile(translatedFilePath, translatedCode + '\n' + mergedSourceMap.toComment());
  } else if (type === 'external') {
    FileUtils.writeFile(
        translatedFilePath,
        translatedCode + '\n//# sourceMappingURL=' + basename(translatedFilePath) + '.map');
    FileUtils.writeFile(translatedFilePath + '.map', mergedSourceMap.toJSON());
  } else if (type === 'hidden') {
    FileUtils.writeFile(translatedFilePath, translatedCode);
    FileUtils.writeFile(translatedFilePath + '.map', mergedSourceMap.toJSON());
  } else {
    FileUtils.writeFile(translatedFilePath, translatedCode);
  }
}

/**
 * Ensure that the source map has the original source content available
 */
export function ensureOriginalSourceContent(
    map: any, relativeFilePath: string, sourceCode: string): void {
  const sourceIndex = map.sources.indexOf(relativeFilePath);
  if (sourceIndex !== -1) {
    map.sourcesContent = map.sourcesContent || [];
    map.sourcesContent[sourceIndex] = sourceCode;
  }
}
