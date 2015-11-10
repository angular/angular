library angular2.test.core.debug.debug_element_view_listener_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachBindings,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/facade/lang.dart" show global;
import "package:angular2/src/core/linker/view_pool.dart"
    show APP_VIEW_POOL_CAPACITY;
import "package:angular2/core.dart"
    show provide, Component, Directive, Injectable, View;
import "package:angular2/src/core/debug.dart" show inspectNativeElement;
import "package:angular2/src/facade/lang.dart" show IS_DART;

@Component(selector: "my-comp")
@View(directives: const [])
@Injectable()
class MyComp {
  String ctxProp;
}

main() {
  describe("element probe", () {
    beforeEachBindings(() => [provide(APP_VIEW_POOL_CAPACITY, useValue: 0)]);
    it(
        "should return a TestElement from a dom element",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideTemplate(MyComp, "<div some-dir></div>")
              .createAsync(MyComp)
              .then((componentFixture) {
            expect(inspectNativeElement(
                    componentFixture.debugElement.nativeElement)
                .componentInstance).toBeAnInstanceOf(MyComp);
            async.done();
          });
        }));
    it(
        "should clean up whent the view is destroyed",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideTemplate(MyComp, "")
              .createAsync(MyComp)
              .then((componentFixture) {
            componentFixture.destroy();
            expect(inspectNativeElement(
                componentFixture.debugElement.nativeElement)).toBe(null);
            async.done();
          });
        }));
    if (!IS_DART) {
      it(
          "should provide a global function to inspect elements",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideTemplate(MyComp, "")
                .createAsync(MyComp)
                .then((componentFixture) {
              expect(global["ng"]
                      ["probe"](componentFixture.debugElement.nativeElement)
                  .componentInstance).toBeAnInstanceOf(MyComp);
              async.done();
            });
          }));
    }
  });
}
