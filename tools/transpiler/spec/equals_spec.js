import {describe, it, expect} from 'angular2/test_lib';

function same(a, b) {
  return a === b;
}

function notSame(a, b) {
  if ((a !== a) && (b !== b)) return true;
  return a !== b;
}

export function main() {
  describe('equals', function() {
    it('should work', function() {
      var obj = {};
      expect(same({}, {}) == false).toBe(true);
      expect(same(obj, obj) == true).toBe(true);
      expect(notSame({}, {}) == true).toBe(true);
      expect(notSame(obj, obj) == false).toBe(true);
    });
  });
}
