library angular2.test.dev_mode_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        xit;
import "package:angular2/src/facade/lang.dart" show assertionsEnabled, IS_DART;

main() {
  describe("dev mode", () {
    it("is enabled in our tests by default", () {
      expect(assertionsEnabled()).toBe(true);
    });
  });
  if (IS_DART) {
    describe("checked mode", () {
      it("is enabled in our tests", () {
        try {
          String s = (42 as dynamic);
          expect(s).toEqual(42);
          throw "should not be reached";
        } catch (e, e_stack) {}
      });
    });
  }
}
