/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compareSegments, offsetSegment} from '../src/segment_marker';
import {computeStartOfLinePositions} from '../src/source_file';

describe('SegmentMarker utils', () => {
  describe('compareSegments()', () => {
    it('should return 0 if the segments are the same', () => {
      expect(compareSegments(
                 {line: 0, column: 0, position: 0, next: undefined},
                 {line: 0, column: 0, position: 0, next: undefined}))
          .toEqual(0);
      expect(compareSegments(
                 {line: 123, column: 0, position: 200, next: undefined},
                 {line: 123, column: 0, position: 200, next: undefined}))
          .toEqual(0);
      expect(compareSegments(
                 {line: 0, column: 45, position: 45, next: undefined},
                 {line: 0, column: 45, position: 45, next: undefined}))
          .toEqual(0);
      expect(compareSegments(
                 {line: 123, column: 45, position: 245, next: undefined},
                 {line: 123, column: 45, position: 245, next: undefined}))
          .toEqual(0);
    });

    it('should return a negative number if the first segment is before the second segment', () => {
      expect(compareSegments(
                 {line: 0, column: 0, position: 0, next: undefined},
                 {line: 0, column: 45, position: 45, next: undefined}))
          .toBeLessThan(0);
      expect(compareSegments(
                 {line: 123, column: 0, position: 200, next: undefined},
                 {line: 123, column: 45, position: 245, next: undefined}))
          .toBeLessThan(0);
      expect(compareSegments(
                 {line: 13, column: 45, position: 75, next: undefined},
                 {line: 123, column: 45, position: 245, next: undefined}))
          .toBeLessThan(0);
      expect(compareSegments(
                 {line: 13, column: 45, position: 75, next: undefined},
                 {line: 123, column: 9, position: 209, next: undefined}))
          .toBeLessThan(0);
    });

    it('should return a positive number if the first segment is after the second segment', () => {
      expect(compareSegments(
                 {line: 0, column: 45, position: 45, next: undefined},
                 {line: 0, column: 0, position: 0, next: undefined}))
          .toBeGreaterThan(0);
      expect(compareSegments(
                 {line: 123, column: 45, position: 245, next: undefined},
                 {line: 123, column: 0, position: 200, next: undefined}))
          .toBeGreaterThan(0);
      expect(compareSegments(
                 {line: 123, column: 45, position: 245, next: undefined},
                 {line: 13, column: 45, position: 75, next: undefined}))
          .toBeGreaterThan(0);
      expect(compareSegments(
                 {line: 123, column: 9, position: 209, next: undefined},
                 {line: 13, column: 45, position: 75, next: undefined}))
          .toBeGreaterThan(0);
    });
  });

  describe('offsetSegment()', () => {
    it('should return an identical marker if offset is 0', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('012345\n0123456789\r\n012*4567\n0123456');
      const marker = {line: 2, column: 3, position: 20, next: undefined};
      expect(offsetSegment(startOfLinePositions, marker, 0)).toBe(marker);
    });

    it('should return a new marker offset by the given chars', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('012345\n0123456789\r\n012*4567\n0123456');
      const marker = {line: 2, column: 3, position: 22, next: undefined};

      expect(offsetSegment(startOfLinePositions, marker, 1))
          .toEqual({line: 2, column: 4, position: 23, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, 2))
          .toEqual({line: 2, column: 5, position: 24, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, 4))
          .toEqual({line: 2, column: 7, position: 26, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, 6))
          .toEqual({line: 3, column: 0, position: 28, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, 8))
          .toEqual({line: 3, column: 2, position: 30, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, 20))
          .toEqual({line: 3, column: 14, position: 42, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -1))
          .toEqual({line: 2, column: 2, position: 21, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -2))
          .toEqual({line: 2, column: 1, position: 20, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -3))
          .toEqual({line: 2, column: 0, position: 19, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -4))
          .toEqual({line: 1, column: 11, position: 18, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -6))
          .toEqual({line: 1, column: 9, position: 16, next: undefined});
      expect(offsetSegment(startOfLinePositions, marker, -16))
          .toEqual({line: 0, column: 6, position: 6, next: undefined});
    });
  });
});
