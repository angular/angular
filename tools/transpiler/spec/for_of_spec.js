import {describe, it, expect} from 'test_lib/test_lib';
import {ArrayWrapper, IterableList} from './fixtures/facade';

export function main() {
  describe('for..of', function() {
    it('should iterate iterable', function() {
      var result = new ArrayWrapper();
      var i = new IterableList(['a', 'b', 'c']);
      for (var value of i) {
        result.push(value);
      }
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });
}

