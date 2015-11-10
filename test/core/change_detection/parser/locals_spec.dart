library angular2.test.core.change_detection.parser.locals_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, xit, iit, expect, beforeEach;
import "package:angular2/src/core/change_detection/parser/locals.dart"
    show Locals;
import "package:angular2/src/facade/collection.dart" show MapWrapper;

main() {
  describe("Locals", () {
    Locals locals;
    beforeEach(() {
      locals = new Locals(
          null,
          MapWrapper.createFromPairs([
            ["key", "value"],
            ["nullKey", null]
          ]));
    });
    it("should support getting values", () {
      expect(locals.get("key")).toBe("value");
      expect(() => locals.get("notPresent"))
          .toThrowError(new RegExp("Cannot find"));
    });
    it("should support checking if key is present", () {
      expect(locals.contains("key")).toBe(true);
      expect(locals.contains("nullKey")).toBe(true);
      expect(locals.contains("notPresent")).toBe(false);
    });
    it("should support setting keys", () {
      locals.set("key", "bar");
      expect(locals.get("key")).toBe("bar");
    });
    it("should not support setting keys that are not present already", () {
      expect(() => locals.set("notPresent", "bar")).toThrowError();
    });
    it("should clearValues", () {
      locals.clearValues();
      expect(locals.get("key")).toBe(null);
    });
  });
}
