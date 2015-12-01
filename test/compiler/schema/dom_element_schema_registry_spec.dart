library angular2.test.compiler.schema.dom_element_schema_registry_spec;

import "package:angular2/testing_internal.dart"
    show
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/src/compiler/schema/dom_element_schema_registry.dart"
    show DomElementSchemaRegistry;

main() {
  // DOMElementSchema can only be used on the JS side where we can safely

  // use reflection for DOM elements
  if (IS_DART) return;
  DomElementSchemaRegistry registry;
  beforeEach(() {
    registry = new DomElementSchemaRegistry();
  });
  describe("DOMElementSchema", () {
    it("should detect properties on regular elements", () {
      expect(registry.hasProperty("div", "id")).toBeTruthy();
      expect(registry.hasProperty("div", "title")).toBeTruthy();
      expect(registry.hasProperty("div", "unknown")).toBeFalsy();
    });
    it("should return true for custom-like elements", () {
      expect(registry.hasProperty("custom-like", "unknown")).toBeTruthy();
    });
    it("should re-map property names that are specified in DOM facade", () {
      expect(registry.getMappedPropName("readonly")).toEqual("readOnly");
    });
    it("should not re-map property names that are not specified in DOM facade",
        () {
      expect(registry.getMappedPropName("title")).toEqual("title");
      expect(registry.getMappedPropName("exotic-unknown"))
          .toEqual("exotic-unknown");
    });
  });
}
