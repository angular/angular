/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as sorcery from '@cush/sorcery';
import {SourceMapConverter, commentRegex, fromJSON, fromObject, fromSource, generateMapFileComment, mapFileCommentRegex, removeComments, removeMapFileComments} from 'convert-source-map';
import * as fs from 'fs';
import {basename, dirname, resolve} from 'path';
import {writeFile} from '../../utils';

export interface SourceMapInfo {
  source: string;
  map: SourceMapConverter|null;
  isInline: boolean;
}

/**
 * Get the map from the source (note whether it is inline or external)
 */
export function extractSourceMap(sourceFilePath: string, sourceCode: string): SourceMapInfo {
  const inline = commentRegex.test(sourceCode);
  const external = mapFileCommentRegex.exec(sourceCode);
  if (inline) {
    const inlineSourceMap = fromSource(sourceCode);
    return {
      source: removeComments(sourceCode).replace(/\n\n$/, '\n'),
      map: inlineSourceMap,
      isInline: true,
    };
  } else if (external) {
    let externalSourceMap: SourceMapConverter|null = null;
    try {
      const fileName = external[1] || external[2];
      const filePath = resolve(dirname(sourceFilePath), fileName);
      const mappingFile = fs.readFileSync(filePath, 'utf8');
      externalSourceMap = fromJSON(mappingFile);
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.warn(
            `The external map file specified in the source code comment "${e.path}" was not found on the file system.`);
        const mapPath = sourceFilePath + '.map';
        if (basename(e.path) !== basename(mapPath) && fs.existsSync(mapPath) &&
            fs.statSync(mapPath).isFile()) {
          console.warn(
              `Guessing the map file name from the source file name: "${basename(mapPath)}"`);
          try {
            externalSourceMap = fromObject(JSON.parse(fs.readFileSync(mapPath, 'utf8')));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    return {
      source: removeMapFileComments(sourceCode).replace(/\n\n$/, '\n'),
      map: externalSourceMap,
      isInline: false,
    };
  } else {
    return {source: sourceCode, map: null, isInline: false};
  }
}

export function writeSourceMap(
    sourceFilePath: string, sourceCode: string, sourceMapObj: object, translatedFilePath: string,
    translatedCode: string, translatedSourceMapObj: object | null, isInline: boolean): void {
  if (!translatedSourceMapObj) {
    return;
  }
  const mergedSourceMapObj = sorcery([
    {content: translatedCode, file: translatedFilePath, map: translatedSourceMapObj},
    {content: sourceCode, file: sourceFilePath, map: sourceMapObj},
  ]);

  const mergedSourceMap = fromObject(mergedSourceMapObj);
  if (isInline) {
    writeFile(translatedFilePath, translatedCode + '\n' + mergedSourceMap.toComment());
  } else {
    writeFile(
        translatedFilePath,
        translatedCode + '\n//# sourceMappingURL=' + basename(translatedFilePath) + '.map');
    writeFile(translatedFilePath + '.map', mergedSourceMap.toJSON());
  }
}
