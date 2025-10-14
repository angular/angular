/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {absoluteFrom} from '../../file_system';
const TS_EXTENSIONS = /\.tsx?$/i;
/**
 * Replace the .ts or .tsx extension of a file with the shim filename suffix.
 */
export function makeShimFileName(fileName, suffix) {
  return absoluteFrom(fileName.replace(TS_EXTENSIONS, suffix));
}
export function generatedModuleName(originalModuleName, originalFileName, genSuffix) {
  let moduleName;
  if (originalFileName.endsWith('/index.ts')) {
    moduleName = originalModuleName + '/index' + genSuffix;
  } else {
    moduleName = originalModuleName + genSuffix;
  }
  return moduleName;
}
//# sourceMappingURL=util.js.map
