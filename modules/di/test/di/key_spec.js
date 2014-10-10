import {describe, it, expect} from 'test_lib/test_lib';
import {Key} from 'di/di';

export function main() {
  describe("key", function () {
    it('should be equal to another key if type is the same', function () {
      expect(Key.get('car')).toBe(Key.get('car'));
    });

    it('should not be equal to another key if types are different', function () {
      expect(Key.get('car')).not.toBe(Key.get('porsche'));
    });

    it('should return the passed in key', function () {
      expect(Key.get(Key.get('car'))).toBe(Key.get('car'));
    });
  });
}