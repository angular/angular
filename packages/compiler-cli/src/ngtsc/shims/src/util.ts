/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath} from '../../file_system';

const TS_EXTENSIONS = /\.tsx?$/i;

/**
 * Replace the .ts or .tsx extension of a file with the shim filename suffix.
 */
export function makeShimFileName(fileName: AbsoluteFsPath, suffix: string): AbsoluteFsPath {
  return absoluteFrom(fileName.replace(TS_EXTENSIONS, suffix));
}

export function generatedModuleName(
    originalModuleName: string, originalFileName: string, genSuffix: string): string {
  let moduleName: string;
  if (originalFileName.endsWith('/index.ts')) {
    moduleName = originalModuleName + '/index' + genSuffix;
  } else {
    moduleName = originalModuleName + genSuffix;
  }

  return moduleName;
}
