import {describe, it, expect, beforeEach} from 'test_lib/test_lib';
import {Key} from 'di/di';

export function main() {
  describe("key", function () {
    beforeEach(function () {
      Key.clear();
    });

    it('should be equal to another key if type is the same', function () {
      expect(Key.get('car')).toBe(Key.get('car'));
    });

    it('should not be equal to another key if types are different', function () {
      expect(Key.get('car')).not.toBe(Key.get('porsche'));
    });

    it('should return the passed in key', function () {
      expect(Key.get(Key.get('car'))).toBe(Key.get('car'));
    });

    describe("metadata", function () {
      it("should assign metadata to a key", function () {
        var key = Key.get('car');

        Key.setMetadata(key, "meta");

        expect(key.metadata).toEqual("meta");
      });

      it("should allow assigning the same metadata twice", function () {
        var key = Key.get('car');

        Key.setMetadata(key, "meta");
        Key.setMetadata(key, "meta");

        expect(key.metadata).toEqual("meta");
      });

      it("should throw when assigning different metadata", function () {
        var key = Key.get('car');

        Key.setMetadata(key, "meta1");

        expect(() => Key.setMetadata(key, "meta2")).toThrowError();
      });
    });
  });
}