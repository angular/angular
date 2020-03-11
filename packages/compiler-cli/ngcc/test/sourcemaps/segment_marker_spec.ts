/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compareSegments, offsetSegment, segmentDiff} from '../../src/sourcemaps/segment_marker';
import {computeStartOfLinePositions} from '../../src/sourcemaps/source_file';

describe('SegmentMarker utils', () => {
  describe('compareSegments()', () => {
    it('should return 0 if the segments are the same', () => {
      expect(compareSegments({line: 0, column: 0}, {line: 0, column: 0})).toEqual(0);
      expect(compareSegments({line: 123, column: 0}, {line: 123, column: 0})).toEqual(0);
      expect(compareSegments({line: 0, column: 45}, {line: 0, column: 45})).toEqual(0);
      expect(compareSegments({line: 123, column: 45}, {line: 123, column: 45})).toEqual(0);
    });

    it('should return a negative number if the first segment is before the second segment', () => {
      expect(compareSegments({line: 0, column: 0}, {line: 0, column: 45})).toBeLessThan(0);
      expect(compareSegments({line: 123, column: 0}, {line: 123, column: 45})).toBeLessThan(0);
      expect(compareSegments({line: 13, column: 45}, {line: 123, column: 45})).toBeLessThan(0);
      expect(compareSegments({line: 13, column: 45}, {line: 123, column: 9})).toBeLessThan(0);
    });

    it('should return a positive number if the first segment is after the second segment', () => {
      expect(compareSegments({line: 0, column: 45}, {line: 0, column: 0})).toBeGreaterThan(0);
      expect(compareSegments({line: 123, column: 45}, {line: 123, column: 0})).toBeGreaterThan(0);
      expect(compareSegments({line: 123, column: 45}, {line: 13, column: 45})).toBeGreaterThan(0);
      expect(compareSegments({line: 123, column: 9}, {line: 13, column: 45})).toBeGreaterThan(0);
    });
  });

  describe('segmentDiff()', () => {
    it('should return 0 if the segments are the same', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('abcdef\nabcdefghj\nabcdefghijklm\nabcdef');
      expect(segmentDiff(startOfLinePositions, {line: 0, column: 0}, {line: 0, column: 0}))
          .toEqual(0);
      expect(segmentDiff(startOfLinePositions, {line: 3, column: 0}, {line: 3, column: 0}))
          .toEqual(0);
      expect(segmentDiff(startOfLinePositions, {line: 0, column: 5}, {line: 0, column: 5}))
          .toEqual(0);
      expect(segmentDiff(startOfLinePositions, {line: 3, column: 5}, {line: 3, column: 5}))
          .toEqual(0);
    });

    it('should return the column difference if the markers are on the same line', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('abcdef\nabcdefghj\nabcdefghijklm\nabcdef');
      expect(segmentDiff(startOfLinePositions, {line: 0, column: 0}, {line: 0, column: 3}))
          .toEqual(3);
      expect(segmentDiff(startOfLinePositions, {line: 1, column: 1}, {line: 1, column: 5}))
          .toEqual(4);
      expect(segmentDiff(startOfLinePositions, {line: 2, column: 5}, {line: 2, column: 1}))
          .toEqual(-4);
      expect(segmentDiff(startOfLinePositions, {line: 3, column: 3}, {line: 3, column: 0}))
          .toEqual(-3);
    });

    it('should return the number of actual characters difference (including newline markers) if not on the same line',
       () => {
         let startOfLinePositions: number[];

         startOfLinePositions = computeStartOfLinePositions('A12345\nB123456789');
         expect(segmentDiff(startOfLinePositions, {line: 0, column: 0}, {line: 1, column: 0}))
             .toEqual(6 + 1);

         startOfLinePositions = computeStartOfLinePositions('012A45\n01234B6789');
         expect(segmentDiff(startOfLinePositions, {line: 0, column: 3}, {line: 1, column: 5}))
             .toEqual(3 + 1 + 5);

         startOfLinePositions =
             computeStartOfLinePositions('012345\n012345A789\n01234567\nB123456');
         expect(segmentDiff(startOfLinePositions, {line: 1, column: 6}, {line: 3, column: 0}))
             .toEqual(4 + 1 + 8 + 1 + 0);

         startOfLinePositions =
             computeStartOfLinePositions('012345\nA123456789\n01234567\n012B456');
         expect(segmentDiff(startOfLinePositions, {line: 1, column: 0}, {line: 3, column: 3}))
             .toEqual(10 + 1 + 8 + 1 + 3);

         startOfLinePositions =
             computeStartOfLinePositions('012345\nB123456789\nA1234567\n0123456');
         expect(segmentDiff(startOfLinePositions, {line: 2, column: 0}, {line: 1, column: 0}))
             .toEqual(0 - 1 - 10 + 0);

         startOfLinePositions =
             computeStartOfLinePositions('012345\n0123B56789\n01234567\n012A456');
         expect(segmentDiff(startOfLinePositions, {line: 3, column: 3}, {line: 1, column: 4}))
             .toEqual(-3 - 1 - 8 - 1 - 10 + 4);

         startOfLinePositions =
             computeStartOfLinePositions('B12345\n0123456789\n0123A567\n0123456');
         expect(segmentDiff(startOfLinePositions, {line: 2, column: 4}, {line: 0, column: 0}))
             .toEqual(-4 - 1 - 10 - 1 - 6 + 0);

         startOfLinePositions =
             computeStartOfLinePositions('0123B5\n0123456789\nA1234567\n0123456');
         expect(segmentDiff(startOfLinePositions, {line: 2, column: 0}, {line: 0, column: 4}))
             .toEqual(0 - 1 - 10 - 1 - 6 + 4);
       });
  });

  describe('offsetSegment()', () => {
    it('should return an identical marker if offset is 0', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('012345\n0123456789\r\n01234567\n0123456');
      const marker = {line: 2, column: 3};
      expect(offsetSegment(startOfLinePositions, marker, 0)).toBe(marker);
    });

    it('should return a new marker offset by the given chars', () => {
      const startOfLinePositions =
          computeStartOfLinePositions('012345\n0123456789\r\n012*4567\n0123456');
      const marker = {line: 2, column: 3};
      expect(offsetSegment(startOfLinePositions, marker, 1)).toEqual({line: 2, column: 4});
      expect(offsetSegment(startOfLinePositions, marker, 2)).toEqual({line: 2, column: 5});
      expect(offsetSegment(startOfLinePositions, marker, 4)).toEqual({line: 2, column: 7});
      expect(offsetSegment(startOfLinePositions, marker, 6)).toEqual({line: 3, column: 0});
      expect(offsetSegment(startOfLinePositions, marker, 8)).toEqual({line: 3, column: 2});
      expect(offsetSegment(startOfLinePositions, marker, 20)).toEqual({line: 3, column: 14});
      expect(offsetSegment(startOfLinePositions, marker, -1)).toEqual({line: 2, column: 2});
      expect(offsetSegment(startOfLinePositions, marker, -2)).toEqual({line: 2, column: 1});
      expect(offsetSegment(startOfLinePositions, marker, -3)).toEqual({line: 2, column: 0});
      expect(offsetSegment(startOfLinePositions, marker, -4)).toEqual({line: 1, column: 10});
      expect(offsetSegment(startOfLinePositions, marker, -6)).toEqual({line: 1, column: 8});
      expect(offsetSegment(startOfLinePositions, marker, -16)).toEqual({line: 0, column: 5});
    });
  });
});