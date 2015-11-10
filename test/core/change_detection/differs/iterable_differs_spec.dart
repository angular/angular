library angular2.test.core.change_detection.differs.iterable_differs_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach;
import "../../spies.dart" show SpyIterableDifferFactory;
import "package:angular2/src/core/change_detection/differs/iterable_differs.dart"
    show IterableDiffers;
import "package:angular2/core.dart" show Injector, provide;

main() {
  describe("IterableDiffers", () {
    var factory1;
    var factory2;
    var factory3;
    beforeEach(() {
      factory1 = new SpyIterableDifferFactory();
      factory2 = new SpyIterableDifferFactory();
      factory3 = new SpyIterableDifferFactory();
    });
    it("should throw when no suitable implementation found", () {
      var differs = new IterableDiffers([]);
      expect(() => differs.find("some object")).toThrowErrorWith(
          "Cannot find a differ supporting object 'some object'");
    });
    it("should return the first suitable implementation", () {
      factory1.spy("supports").andReturn(false);
      factory2.spy("supports").andReturn(true);
      factory3.spy("supports").andReturn(true);
      var differs =
          IterableDiffers.create(([factory1, factory2, factory3] as dynamic));
      expect(differs.find("some object")).toBe(factory2);
    });
    it("should copy over differs from the parent repo", () {
      factory1.spy("supports").andReturn(true);
      factory2.spy("supports").andReturn(false);
      var parent = IterableDiffers.create(([factory1] as dynamic));
      var child = IterableDiffers.create(([factory2] as dynamic), parent);
      expect(child.factories).toEqual([factory2, factory1]);
    });
    describe(".extend()", () {
      it("should throw if calling extend when creating root injector", () {
        var injector = Injector.resolveAndCreate([IterableDiffers.extend([])]);
        expect(() => injector.get(IterableDiffers)).toThrowErrorWith(
            "Cannot extend IterableDiffers without a parent injector");
      });
      it("should extend di-inherited diffesr", () {
        var parent = new IterableDiffers([factory1]);
        var injector = Injector
            .resolveAndCreate([provide(IterableDiffers, useValue: parent)]);
        var childInjector = injector.resolveAndCreateChild([
          IterableDiffers.extend([factory2])
        ]);
        expect(injector.get(IterableDiffers).factories).toEqual([factory1]);
        expect(childInjector.get(IterableDiffers).factories)
            .toEqual([factory2, factory1]);
      });
    });
  });
}
