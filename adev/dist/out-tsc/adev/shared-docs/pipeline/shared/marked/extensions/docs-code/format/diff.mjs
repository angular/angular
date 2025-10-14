/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {diffLines} from 'diff';
import {loadWorkspaceRelativeFile} from '../../../helpers.mjs';
/**
 * Updates the provided token with diff information if a path to a diff is provided.
 */
export function calculateDiff(token) {
  if (!token.diff) {
    return;
  }
  const diffCode = loadWorkspaceRelativeFile(token.diff);
  const change = diffLines(diffCode, token.code);
  const getLinesRange = (start, count) => Array.from(Array(count).keys()).map((i) => i + start);
  let processedLines = 0;
  token.diffMetadata = change.reduce(
    (prev, part) => {
      const diff = {
        code: `${prev.code}${part.value}`,
        linesAdded: part.added
          ? [...prev.linesAdded, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesAdded,
        linesRemoved: part.removed
          ? [...prev.linesRemoved, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesRemoved,
      };
      processedLines += part.count ?? 0;
      return diff;
    },
    {
      code: '',
      linesAdded: [],
      linesRemoved: [],
    },
  );
  token.code = token.diffMetadata.code;
}
//# sourceMappingURL=diff.mjs.map
