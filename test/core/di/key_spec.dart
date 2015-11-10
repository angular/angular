library angular2.test.core.di.key_spec;

import "package:angular2/testing_internal.dart"
    show describe, iit, it, expect, beforeEach;
import "package:angular2/src/core/di/key.dart" show Key, KeyRegistry;

main() {
  describe("key", () {
    KeyRegistry registry;
    beforeEach(() {
      registry = new KeyRegistry();
    });
    it("should be equal to another key if type is the same", () {
      expect(registry.get("car")).toBe(registry.get("car"));
    });
    it("should not be equal to another key if types are different", () {
      expect(registry.get("car")).not.toBe(registry.get("porsche"));
    });
    it("should return the passed in key", () {
      expect(registry.get(registry.get("car"))).toBe(registry.get("car"));
    });
  });
}
