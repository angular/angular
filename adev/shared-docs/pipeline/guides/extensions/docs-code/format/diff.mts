/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {diffLines, Change as DiffChange} from 'diff';
import {CodeToken} from './index.mjs';
import {loadWorkspaceRelativeFile} from '../../../utils.mjs';

export interface DiffMetadata {
  code: string;
  linesAdded: number[];
  linesRemoved: number[];
}

/**
 * Updates the provided token with diff information if a path to a diff is provided.
 */
export function calculateDiff(token: CodeToken) {
  if (!token.diff) {
    return;
  }

  const diffCode = loadWorkspaceRelativeFile(token.diff);
  const change = diffLines(diffCode, token.code);

  const getLinesRange = (start: number, count: number): number[] =>
    Array.from(Array(count).keys()).map((i) => i + start);

  let processedLines = 0;

  token.diffMetadata = change.reduce(
    (prev: DiffMetadata, part: DiffChange) => {
      const diff: DiffMetadata = {
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
