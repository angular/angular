/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function filterFileByPatterns(
    fileName: string, options: {includeFilePattern?: RegExp, excludeFilePattern?: RegExp} = {}) {
  let match = true;
  if (options.includeFilePattern) {
    match = match && !!options.includeFilePattern.exec(fileName);
  }
  if (options.excludeFilePattern) {
    match = match && !options.excludeFilePattern.exec(fileName);
  }
  return match;
}