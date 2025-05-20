/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Cuts the given string into lines basing around the specified
 * line length limit. This function breaks the string on a per-word basis.
 */
export function cutStringToLineLimit(str: string, limit: number): string[] {
  const words = str.split(' ');
  const chunks: string[] = [];
  let chunkIdx = 0;

  while (words.length) {
    // New line if we exceed limit.
    if (chunks[chunkIdx] !== undefined && chunks[chunkIdx].length > limit) {
      chunkIdx++;
    }
    // Ensure line is initialized for the given index.
    if (chunks[chunkIdx] === undefined) {
      chunks[chunkIdx] = '';
    }

    const word = words.shift();
    const needsSpace = chunks[chunkIdx].length > 0;

    // Insert word. Add space before, if the line already contains text.
    chunks[chunkIdx] += `${needsSpace ? ' ' : ''}${word}`;
  }

  return chunks;
}
