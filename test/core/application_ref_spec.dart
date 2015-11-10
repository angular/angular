library angular2.test.core.application_ref_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        el,
        AsyncTestCompleter,
        fakeAsync,
        tick,
        inject;
import "spies.dart" show SpyChangeDetector;
import "package:angular2/src/core/application_ref.dart" show ApplicationRef_;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef_;

main() {
  describe("ApplicationRef", () {
    it("should throw when reentering tick", () {
      var cd = (new SpyChangeDetector() as dynamic);
      var ref = new ApplicationRef_(null, null, null);
      ref.registerChangeDetector(new ChangeDetectorRef_(cd));
      cd.spy("detectChanges").andCallFake(() => ref.tick());
      expect(() => ref.tick())
          .toThrowError("ApplicationRef.tick is called recursively");
    });
  });
}
