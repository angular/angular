import {describe, it, expect, beforeEach, ddescribe, iit, xit}
  from 'angular2/test_lib';

import {List, ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('ListWrapper', () => {
    describe('splice', () => {
      it('should remove sublist of given length and return it',  () => {
        var list = [1, 2, 3, 4, 5, 6];
        expect(ListWrapper.splice(list, 1, 3)).toEqual([2, 3, 4]);
        expect(list).toEqual([1, 5, 6]);
      });
    });
 });
}
