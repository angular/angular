import {describe, iit, it, expect, beforeEach} from 'test_lib/test_lib';
import {Key, KeyRegistry} from 'di/di';

export function main() {

  describe("key", function () {
    var registry;

    beforeEach(function () {
      registry = new KeyRegistry();
    });

    it('should be equal to another key if type is the same', function () {
      expect(registry.get('car')).toBe(registry.get('car'));
    });

    it('should not be equal to another key if types are different', function () {
      expect(registry.get('car')).not.toBe(registry.get('porsche'));
    });

    it('should return the passed in key', function () {
      expect(registry.get(registry.get('car'))).toBe(registry.get('car'));
    });

    describe("metadata", function () {
      it("should assign metadata to a key", function () {
        var key = registry.get('car');

        Key.setMetadata(key, "meta");

        expect(key.metadata).toEqual("meta");
      });

      it("should allow assigning the same metadata twice", function () {
        var key = registry.get('car');

        Key.setMetadata(key, "meta");
        Key.setMetadata(key, "meta");

        expect(key.metadata).toEqual("meta");
      });

      it("should throw when assigning different metadata", function () {
        var key = registry.get('car');

        Key.setMetadata(key, "meta1");

        expect(() => Key.setMetadata(key, "meta2")).toThrowError();
      });
    });
  });
}