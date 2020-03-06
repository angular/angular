/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compareSegments, offsetSegment, segmentDiff} from '../../src/sourcemaps/segment_marker';
import {computeLineLengths} from '../../src/sourcemaps/source_file';

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
      const lineLengths = computeLineLengths('abcdef\nabcdefghj\nabcdefghijklm\nabcdef');
      expect(segmentDiff(lineLengths, {line: 0, column: 0}, {line: 0, column: 0})).toEqual(0);
      expect(segmentDiff(lineLengths, {line: 3, column: 0}, {line: 3, column: 0})).toEqual(0);
      expect(segmentDiff(lineLengths, {line: 0, column: 5}, {line: 0, column: 5})).toEqual(0);
      expect(segmentDiff(lineLengths, {line: 3, column: 5}, {line: 3, column: 5})).toEqual(0);
    });

    it('should return the column difference if the markers are on the same line', () => {
      const lineLengths = computeLineLengths('abcdef\nabcdefghj\nabcdefghijklm\nabcdef');
      expect(segmentDiff(lineLengths, {line: 0, column: 0}, {line: 0, column: 3})).toEqual(3);
      expect(segmentDiff(lineLengths, {line: 1, column: 1}, {line: 1, column: 5})).toEqual(4);
      expect(segmentDiff(lineLengths, {line: 2, column: 5}, {line: 2, column: 1})).toEqual(-4);
      expect(segmentDiff(lineLengths, {line: 3, column: 3}, {line: 3, column: 0})).toEqual(-3);
    });

    it('should return the number of actual characters difference (including newlineLengths) if not on the same line',
       () => {
         let lineLengths: number[];

         lineLengths = computeLineLengths('A12345\nB123456789');
         expect(segmentDiff(lineLengths, {line: 0, column: 0}, {line: 1, column: 0}))
             .toEqual(6 + 1);

         lineLengths = computeLineLengths('012A45\n01234B6789');
         expect(segmentDiff(lineLengths, {line: 0, column: 3}, {line: 1, column: 5}))
             .toEqual(3 + 1 + 5);

         lineLengths = computeLineLengths('012345\n012345A789\n01234567\nB123456');
         expect(segmentDiff(lineLengths, {line: 1, column: 6}, {line: 3, column: 0}))
             .toEqual(4 + 1 + 8 + 1 + 0);

         lineLengths = computeLineLengths('012345\nA123456789\n01234567\n012B456');
         expect(segmentDiff(lineLengths, {line: 1, column: 0}, {line: 3, column: 3}))
             .toEqual(10 + 1 + 8 + 1 + 3);

         lineLengths = computeLineLengths('012345\nB123456789\nA1234567\n0123456');
         expect(segmentDiff(lineLengths, {line: 2, column: 0}, {line: 1, column: 0}))
             .toEqual(0 - 1 - 10 + 0);

         lineLengths = computeLineLengths('012345\n0123B56789\n01234567\n012A456');
         expect(segmentDiff(lineLengths, {line: 3, column: 3}, {line: 1, column: 4}))
             .toEqual(-3 - 1 - 8 - 1 - 10 + 4);

         lineLengths = computeLineLengths('B12345\n0123456789\n0123A567\n0123456');
         expect(segmentDiff(lineLengths, {line: 2, column: 4}, {line: 0, column: 0}))
             .toEqual(-4 - 1 - 10 - 1 - 6 + 0);

         lineLengths = computeLineLengths('0123B5\n0123456789\nA1234567\n0123456');
         expect(segmentDiff(lineLengths, {line: 2, column: 0}, {line: 0, column: 4}))
             .toEqual(0 - 1 - 10 - 1 - 6 + 4);
       });
  });

  describe('offsetSegment()', () => {
    it('should return an identical marker if offset is 0', () => {
      const lineLengths = computeLineLengths('012345\n0123456789\n01234567\n0123456');
      const marker = {line: 2, column: 3};
      expect(offsetSegment(lineLengths, marker, 0)).toBe(marker);
    });

    it('should return a new marker offset by the given chars', () => {
      const lineLengths = computeLineLengths('012345\n0123456789\n012*4567\n0123456');
      const marker = {line: 2, column: 3};
      expect(offsetSegment(lineLengths, marker, 1)).toEqual({line: 2, column: 4});
      expect(offsetSegment(lineLengths, marker, 2)).toEqual({line: 2, column: 5});
      expect(offsetSegment(lineLengths, marker, 4)).toEqual({line: 2, column: 7});
      expect(offsetSegment(lineLengths, marker, 8)).toEqual({line: 3, column: 2});
      expect(offsetSegment(lineLengths, marker, -1)).toEqual({line: 2, column: 2});
      expect(offsetSegment(lineLengths, marker, -2)).toEqual({line: 2, column: 1});
      expect(offsetSegment(lineLengths, marker, -4)).toEqual({line: 1, column: 10});
      expect(offsetSegment(lineLengths, marker, -6)).toEqual({line: 1, column: 8});
    });
  });
});