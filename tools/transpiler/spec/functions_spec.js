import {describe, it, expect} from 'test_lib/test_lib';

function sum(a, b) {
  return a + b;
}

export function main() {
  describe('functions', function() {
    it('should work', function() {
      expect(sum(1, 2)).toBe(3);
    });
  });
}
