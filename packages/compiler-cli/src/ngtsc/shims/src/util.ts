/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
