import {describe, it, expect} from 'test_lib/test_lib';
import {ArrayWrapper} from './fixtures/facade';

export function main() {
  describe('for..of', function() {
    it('should iterate array', function() {
      var result = new ArrayWrapper();
      for (var value of ['a', 'b', 'c']) {
        result.push(value);
      }
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });
}

