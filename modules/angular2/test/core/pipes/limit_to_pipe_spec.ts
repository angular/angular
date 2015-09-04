import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {LimitToPipe} from 'angular2/pipes';

export function main() {
  describe("LimitToPipe", () => {
    var list;
    var str;
    var pipe;

    beforeEach(() => {
      list = [1, 2, 3, 4, 5];
      str = 'tuvwxyz';
      pipe = new LimitToPipe();
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

      it('should return the first X items when X is positive', () => {
        expect(pipe.transform(list, [3])).toEqual([1, 2, 3]);
        expect(pipe.transform(str, [3])).toEqual('tuv');
      });

      it('should return the last X items when X is negative', () => {
        expect(pipe.transform(list, [-3])).toEqual([3, 4, 5]);
        expect(pipe.transform(str, [-3])).toEqual('xyz');
      });

      it('should return a copy of input array if X is exceeds array length', () => {
        expect(pipe.transform(list, [20])).toEqual(list);
        expect(pipe.transform(list, [-20])).toEqual(list);
      });

      it('should return the entire string if X exceeds input length', () => {
        expect(pipe.transform(str, [20])).toEqual(str);
        expect(pipe.transform(str, [-20])).toEqual(str);
      });

      it('should not modify the input list', () => {
        expect(pipe.transform(list, [3])).toEqual([1, 2, 3]);
        expect(list).toEqual([1, 2, 3, 4, 5]);
      });

    });

  });
}
