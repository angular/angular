import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  browserDetection
} from 'angular2/testing_internal';

import {SlicePipe} from 'angular2/src/core/pipes';

export function main() {
  describe("SlicePipe", () => {
    var list;
    var str;
    var pipe;

    beforeEach(() => {
      list = [1, 2, 3, 4, 5];
      str = 'tuvwxyz';
      pipe = new SlicePipe();
    });

    describe("supports", () => {
      it("should support strings", () => { expect(pipe.supports(str)).toBe(true); });
      it("should support lists", () => { expect(pipe.supports(list)).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports(new Object())).toBe(false);
        expect(pipe.supports(null)).toBe(false);
      });
    });

    describe("transform", () => {

      it('should return all items after START index when START is positive and END is omitted',
         () => {
           expect(pipe.transform(list, [3])).toEqual([4, 5]);
           expect(pipe.transform(str, [3])).toEqual('wxyz');
         });

      it('should return last START items when START is negative and END is omitted', () => {
        expect(pipe.transform(list, [-3])).toEqual([3, 4, 5]);
        expect(pipe.transform(str, [-3])).toEqual('xyz');
      });

      it('should return all items between START and END index when START and END are positive',
         () => {
           expect(pipe.transform(list, [1, 3])).toEqual([2, 3]);
           expect(pipe.transform(str, [1, 3])).toEqual('uv');
         });

      it('should return all items between START and END from the end when START and END are negative',
         () => {
           expect(pipe.transform(list, [-4, -2])).toEqual([2, 3]);
           expect(pipe.transform(str, [-4, -2])).toEqual('wx');
         });

      it('should return an empty value if START is greater than END', () => {
        expect(pipe.transform(list, [4, 2])).toEqual([]);
        expect(pipe.transform(str, [4, 2])).toEqual('');
      });

      it('should return an empty value if START greater than input length', () => {
        expect(pipe.transform(list, [99])).toEqual([]);
        expect(pipe.transform(str, [99])).toEqual('');
      });

      // Makes Edge to disconnect when running the full unit test campaign
      // TODO: remove when issue is solved: https://github.com/angular/angular/issues/4756
      if (!browserDetection.isEdge) {
        it('should return entire input if START is negative and greater than input length', () => {
          expect(pipe.transform(list, [-99])).toEqual([1, 2, 3, 4, 5]);
          expect(pipe.transform(str, [-99])).toEqual('tuvwxyz');
        });

        it('should not modify the input list', () => {
          expect(pipe.transform(list, [2])).toEqual([3, 4, 5]);
          expect(list).toEqual([1, 2, 3, 4, 5]);
        });
      }

    });

  });
}