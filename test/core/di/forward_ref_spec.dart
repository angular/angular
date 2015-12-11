library angular2.test.core.di.forward_ref_spec;

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
        xit;
import "package:angular2/src/core/di.dart" show resolveForwardRef;
import "package:angular2/src/facade/lang.dart" show Type;

main() {
  describe("forwardRef", () {
    it("should wrap and unwrap the reference", () {
      var ref = String;
      expect(ref is Type).toBe(true);
      expect(resolveForwardRef(ref)).toBe(String);
    });
  });
}
