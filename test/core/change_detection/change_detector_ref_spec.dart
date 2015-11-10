library angular2.test.core.change_detection.change_detector_ref_spec;

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
        tick,
        fakeAsync;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef, ChangeDetectorRef_;
import "../spies.dart" show SpyChangeDetector;

main() {
  describe("ChangeDetectorRef", () {
    it("should delegate detectChanges()", () {
      var changeDetector = new SpyChangeDetector();
      changeDetector.spy("detectChanges");
      var changeDetectorRef =
          new ChangeDetectorRef_((changeDetector as dynamic));
      changeDetectorRef.detectChanges();
      expect(changeDetector.spy("detectChanges")).toHaveBeenCalled();
    });
  });
}
