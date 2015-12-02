library angular2.test.core.linker.view_container_ref_spec;

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
        xit;
import "../spies.dart" show SpyView, SpyAppViewManager;
import "package:angular2/src/core/linker/view.dart"
    show AppView, AppViewContainer;
import "package:angular2/src/core/linker/view_container_ref.dart"
    show ViewContainerRef, ViewContainerRef_;
import "package:angular2/src/core/linker/element_ref.dart"
    show ElementRef, ElementRef_;
import "package:angular2/src/core/linker/view_ref.dart" show ViewRef, ViewRef_;

main() {
  // TODO(tbosch): add missing tests
  describe("ViewContainerRef", () {
    var location;
    var view;
    var viewManager;
    createViewContainer() {
      return new ViewContainerRef_(viewManager, location);
    }
    beforeEach(() {
      viewManager = new SpyAppViewManager();
      view = new SpyView();
      view.prop("viewContainers", [null]);
      location = new ElementRef_(new ViewRef_(view), 0, null);
    });
    describe("length", () {
      it("should return a 0 length if there is no underlying AppViewContainer",
          () {
        var vc = createViewContainer();
        expect(vc.length).toBe(0);
      });
      it("should return the size of the underlying AppViewContainer", () {
        var vc = createViewContainer();
        var appVc = new AppViewContainer();
        view.prop("viewContainers", [appVc]);
        appVc.views = [(new SpyView() as dynamic)];
        expect(vc.length).toBe(1);
      });
    });
  });
}
