/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Replacement, TextUpdate} from '../replacement';
import {ProjectRootRelativePath} from '../project_paths';

/**
 * Groups the given replacements per project relative
 * file path.
 *
 * This allows for simple execution of the replacements
 * against a given file. E.g. via {@link applyTextUpdates}.
 */
export function groupReplacementsByFile(
  replacements: Replacement[],
): Map<ProjectRootRelativePath, TextUpdate[]> {
  const result = new Map<ProjectRootRelativePath, TextUpdate[]>();
  for (const {projectFile, update} of replacements) {
    if (!result.has(projectFile.rootRelativePath)) {
      result.set(projectFile.rootRelativePath, []);
    }
    result.get(projectFile.rootRelativePath)!.push(update);
  }
  return result;
}
