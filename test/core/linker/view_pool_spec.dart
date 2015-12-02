library angular2.test.core.linker.view_pool_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit,
        SpyObject,
        proxy;
import "package:angular2/src/core/linker/view_pool.dart" show AppViewPool;
import "package:angular2/src/core/linker/view.dart" show AppProtoView, AppView;
import "package:angular2/src/facade/collection.dart" show MapWrapper, Map;

main() {
  describe("AppViewPool", () {
    AppViewPool createViewPool({capacity}) {
      return new AppViewPool(capacity);
    }
    createProtoView() {
      return new AppProtoView(null, null, null, null, null, null, null);
    }
    createView(pv) {
      return new AppView(null, pv, null, null, null, new Map<String, dynamic>(),
          null, null, null);
    }
    it("should support multiple AppProtoViews", () {
      var vf = createViewPool(capacity: 2);
      var pv1 = createProtoView();
      var pv2 = createProtoView();
      var view1 = createView(pv1);
      var view2 = createView(pv2);
      vf.returnView(view1);
      vf.returnView(view2);
      expect(vf.getView(pv1)).toBe(view1);
      expect(vf.getView(pv2)).toBe(view2);
    });
    it("should reuse the newest view that has been returned", () {
      var pv = createProtoView();
      var vf = createViewPool(capacity: 2);
      var view1 = createView(pv);
      var view2 = createView(pv);
      vf.returnView(view1);
      vf.returnView(view2);
      expect(vf.getView(pv)).toBe(view2);
    });
    it("should not add views when the capacity has been reached", () {
      var pv = createProtoView();
      var vf = createViewPool(capacity: 2);
      var view1 = createView(pv);
      var view2 = createView(pv);
      var view3 = createView(pv);
      expect(vf.returnView(view1)).toBe(true);
      expect(vf.returnView(view2)).toBe(true);
      expect(vf.returnView(view3)).toBe(false);
      expect(vf.getView(pv)).toBe(view2);
      expect(vf.getView(pv)).toBe(view1);
    });
  });
}
