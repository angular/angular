/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Line mapping utilities which can be used to retrieve line and character based
 * on an absolute character position in a given file. This functionality is similar
 * to TypeScript's "ts.getLineAndCharacterFromPosition" utility, but we cannot leverage
 * their logic for line mappings as it's internal and we need to generate line mappings
 * for non-TypeScript files such as HTML templates or stylesheets.
 *
 * Line and character can be retrieved by splitting a given source text based on
 * line breaks into line start entries. Later when a specific position is requested,
 * the closest line-start position is determined based on the given position.
 */

const LF_CHAR = 10;
const CR_CHAR = 13;
const LINE_SEP_CHAR = 8232;
const PARAGRAPH_CHAR = 8233;

export interface LineAndCharacter {
  character: number;
  line: number;
}

/** Gets the line and character for the given position from the line starts map. */
export function getLineAndCharacterFromPosition(lineStartsMap: number[], position: number) {
  const lineIndex = findClosestLineStartPosition(lineStartsMap, position);
  return {character: position - lineStartsMap[lineIndex], line: lineIndex};
}

/**
 * Computes the line start map of the given text. This can be used in order to
 * retrieve the line and character of a given text position index.
 */
export function computeLineStartsMap(text: string): number[] {
  const result: number[] = [0];
  let pos = 0;
  while (pos < text.length) {
    const char = text.charCodeAt(pos++);
    // Handles the "CRLF" line break. In that case we peek the character
    // after the "CR" and check if it is a line feed.
    if (char === CR_CHAR) {
      if (text.charCodeAt(pos) === LF_CHAR) {
        pos++;
      }
      result.push(pos);
    } else if (char === LF_CHAR || char === LINE_SEP_CHAR || char === PARAGRAPH_CHAR) {
      result.push(pos);
    }
  }
  result.push(pos);
  return result;
}

/** Finds the closest line start for the given position. */
function findClosestLineStartPosition<T>(
    linesMap: T[], position: T, low = 0, high = linesMap.length - 1) {
  while (low <= high) {
    const pivotIndex = Math.floor((low + high) / 2);
    const pivotEl = linesMap[pivotIndex];

    if (pivotEl === position) {
      return pivotIndex;
    } else if (position > pivotEl) {
      low = pivotIndex + 1;
    } else {
      high = pivotIndex - 1;
    }
  }

  // In case there was no exact match, return the closest "lower" line index. We also
  // subtract the index by one because want the index of the previous line start.
  return low - 1;
}
