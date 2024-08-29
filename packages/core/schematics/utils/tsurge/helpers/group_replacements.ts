/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProjectRelativePath, Replacement, TextUpdate} from '../replacement';

/**
 * Groups the given replacements per file path.
 *
 * This allows for simple execution of the replacements
 * against a given file. E.g. via {@link applyTextUpdates}.
 */
export function groupReplacementsByFile(
  replacements: Replacement[],
): Map<ProjectRelativePath, TextUpdate[]> {
  const result = new Map<ProjectRelativePath, TextUpdate[]>();
  for (const {projectRelativePath, update} of replacements) {
    if (!result.has(projectRelativePath)) {
      result.set(projectRelativePath, []);
    }
    result.get(projectRelativePath)!.push(update);
  }
  return result;
}
