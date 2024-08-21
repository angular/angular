/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {Replacement, TextUpdate} from '../replacement';

/**
 * Groups the given replacements per file path.
 *
 * This allows for simple execution of the replacements
 * against a given file. E.g. via {@link applyTextUpdates}.
 */
export function groupReplacementsByFile(
  replacements: Replacement[],
): Map<AbsoluteFsPath, TextUpdate[]> {
  const result = new Map<AbsoluteFsPath, TextUpdate[]>();
  for (const {absoluteFilePath, update} of replacements) {
    if (!result.has(absoluteFilePath)) {
      result.set(absoluteFilePath, []);
    }
    result.get(absoluteFilePath)!.push(update);
  }
  return result;
}
