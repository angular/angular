import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {OrderByPipe} from 'angular2/src/change_detection/pipes/order_by_pipe';

class Name {
  constructor(public firstName: string, public lastName: string) {}
}

export function main() {
  describe("OrderByPipe", () => {
    var items;
    var pipe;

    beforeEach(() => { pipe = new OrderByPipe(); });

    describe("supports", () => {
      it("should support lists", () => { expect(pipe.supports([])).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports(new Object())).toBe(false);
        expect(pipe.supports('str')).toBe(false);
        expect(pipe.supports(null)).toBe(false);
      });
    });

    describe("transform", () => {
      describe("integers", () => {
        beforeEach(() => items = [5, 3, 1, 2, 4]);

        it('should sort in ascending order', () => {
          expect(pipe.transform(items, [''])).toEqual([1, 2, 3, 4, 5]);
          expect(pipe.transform(items, ['+'])).toEqual([1, 2, 3, 4, 5]);
          expect(pipe.transform(items, ['-', true])).toEqual([1, 2, 3, 4, 5]);
        });

        it('should sort in descending order', () => {
          expect(pipe.transform(items, ['-'])).toEqual([5, 4, 3, 2, 1]);
          expect(pipe.transform(items, ['+', true])).toEqual([5, 4, 3, 2, 1]);
        });

        it('should accept a mapper function',
           () => { expect(pipe.transform(items, [(n) => -n])).toEqual([5, 4, 3, 2, 1]); });
      });

      describe("strings", () => {
        it('should sort case sensitive', () => {
          items = ['aa', 'Ab', 'B'];
          expect(pipe.transform(items, [''])).toEqual(['Ab', 'B', 'aa']);
          expect(pipe.transform(items, ['toLowerCase()'])).toEqual(['aa', 'Ab', 'B']);
        });
      });

      describe("objects", () => {
        var Emily_Bronte = new Name('Emily', 'Bronte'),
            Emily_Arnolds = new Name('Emily', 'Arnolds'), Mark__Twain = new Name('Mark', 'Twain'),
            Jeff__Archer = new Name('Jeff', 'Archer'), Isaac_Asimov = new Name('Isaac', 'Asimov'),
            Oscar_Wilde = new Name('Oscar', 'Wilde');

        it('should sort by expression', () => {
          items = [Emily_Bronte, Mark__Twain, Jeff__Archer, Isaac_Asimov, Oscar_Wilde];
          expect(pipe.transform(items, ['firstName']))
              .toEqual([Emily_Bronte, Isaac_Asimov, Jeff__Archer, Mark__Twain, Oscar_Wilde]);

          expect(pipe.transform(items, ['lastName']))
              .toEqual([Jeff__Archer, Isaac_Asimov, Emily_Bronte, Mark__Twain, Oscar_Wilde]);

          expect(pipe.transform(items, ['-firstName']))
              .toEqual([Oscar_Wilde, Mark__Twain, Jeff__Archer, Isaac_Asimov, Emily_Bronte]);
        });

        it('should break ties with the additional expressions', () => {
          items = [Emily_Bronte, Emily_Arnolds, Jeff__Archer];

          expect(pipe.transform(items, [['firstName', 'lastName']]))
              .toEqual([Emily_Arnolds, Emily_Bronte, Jeff__Archer]);

          expect(pipe.transform(items, [['firstName', '-lastName']]))
              .toEqual([Emily_Bronte, Emily_Arnolds, Jeff__Archer]);

          expect(pipe.transform(items, [['-firstName', '-lastName']]))
              .toEqual([Jeff__Archer, Emily_Bronte, Emily_Arnolds]);
        });
      });
    });
  });
}
