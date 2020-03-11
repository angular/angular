/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
* A marker that indicates the start of a segment in a mapping.
*
* The end of a segment is indicated by the the first segment-marker of another mapping whose start
* is greater or equal to this one.
*/
export interface SegmentMarker {
  readonly line: number;
  readonly column: number;
}

/**
 * Compare two segment-markers, for use in a search or sorting algorithm.
 *
 * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
 * and zero if they are at the same position.
 */
export function compareSegments(a: SegmentMarker, b: SegmentMarker): number {
  return a.line === b.line ? a.column - b.column : a.line - b.line;
}

/**
 * Compute the difference between two segment markers in a source file.
 *
 * @param startOfLinePositions the position of the start of each line of content of the source file
 * where we are computing the difference
 * @param a the start marker
 * @param b the end marker
 * @returns the number of characters between the two segments `a` and `b`
 */
export function segmentDiff(startOfLinePositions: number[], a: SegmentMarker, b: SegmentMarker) {
  return startOfLinePositions[b.line] - startOfLinePositions[a.line] + b.column - a.column;
}

/**
 * Return a new segment-marker that is offset by the given number of characters.
 *
 * @param startOfLinePositions the position of the start of each line of content of the source file
 * whose segment-marker we are offsetting.
 * @param marker the segment to offset.
 * @param offset the number of character to offset by.
 */
export function offsetSegment(
    startOfLinePositions: number[], marker: SegmentMarker, offset: number) {
  if (offset === 0) {
    return marker;
  }

  let line = marker.line;
  const newPos = startOfLinePositions[line] + marker.column + offset;
  while (line < startOfLinePositions.length - 1 && startOfLinePositions[line + 1] <= newPos) {
    line++;
  }
  while (line > 0 && startOfLinePositions[line] > newPos) {
    line--;
  }
  const column = newPos - startOfLinePositions[line];
  return {line, column};
}
