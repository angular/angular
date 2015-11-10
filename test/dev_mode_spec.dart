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
import "package:angular2/src/facade/lang.dart" show assertionsEnabled;

main() {
  describe("dev mode", () {
    it("is enabled in our tests by default", () {
      expect(assertionsEnabled()).toBe(true);
    });
  });
}
