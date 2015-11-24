library angular2.test.tools.tools_spec;

import "package:angular2/testing_internal.dart"
    show
        afterEach,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/tools.dart" show enableDebugTools, disableDebugTools;
import "spies.dart" show SpyComponentRef, callNgProfilerTimeChangeDetection;

main() {
  describe("profiler", () {
    beforeEach(() {
      enableDebugTools(((new SpyComponentRef() as dynamic)));
    });
    afterEach(() {
      disableDebugTools();
    });
    it("should time change detection", () {
      callNgProfilerTimeChangeDetection();
    });
    it("should time change detection with recording", () {
      callNgProfilerTimeChangeDetection({"record": true});
    });
  });
}
