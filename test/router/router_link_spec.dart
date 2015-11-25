library angular2.test.router.router_link_spec;

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
        beforeEachProviders,
        it,
        xit,
        TestComponentBuilder;
import "spies.dart" show SpyRouter, SpyLocation;
import "package:angular2/core.dart" show provide, Component, View;
import "package:angular2/platform/common_dom.dart" show By;
import "package:angular2/router.dart"
    show
        Location,
        Router,
        RouteRegistry,
        RouterLink,
        RouterOutlet,
        Route,
        RouteParams,
        ComponentInstruction;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/router/instruction.dart" show ResolvedInstruction;

var dummyInstruction = new ResolvedInstruction(
    new ComponentInstruction("detail", [], null, null, true, 0), null, {});
main() {
  describe("router-link directive", () {
    TestComponentBuilder tcb;
    beforeEachProviders(() => [
          provide(Location, useValue: makeDummyLocation()),
          provide(Router, useValue: makeDummyRouter())
        ]);
    beforeEach(inject([TestComponentBuilder], (tcBuilder) {
      tcb = tcBuilder;
    }));
    it(
        "should update a[href] attribute",
        inject([AsyncTestCompleter], (async) {
          tcb.createAsync(TestComponent).then((testComponent) {
            testComponent.detectChanges();
            var anchorElement = testComponent.debugElement
                .query(By.css("a.detail-view"))
                .nativeElement;
            expect(DOM.getAttribute(anchorElement, "href")).toEqual("detail");
            async.done();
          });
        }));
    it(
        "should call router.navigate when a link is clicked",
        inject([AsyncTestCompleter, Router], (async, router) {
          tcb.createAsync(TestComponent).then((testComponent) {
            testComponent.detectChanges();
            // TODO: shouldn't this be just 'click' rather than '^click'?
            testComponent.debugElement
                .query(By.css("a.detail-view"))
                .triggerEventHandler("click", null);
            expect(router.spy("navigateByInstruction"))
                .toHaveBeenCalledWith(dummyInstruction);
            async.done();
          });
        }));
    it(
        "should call router.navigate when a link is clicked if target is _self",
        inject([AsyncTestCompleter, Router], (async, router) {
          tcb.createAsync(TestComponent).then((testComponent) {
            testComponent.detectChanges();
            testComponent.debugElement
                .query(By.css("a.detail-view-self"))
                .triggerEventHandler("click", null);
            expect(router.spy("navigateByInstruction"))
                .toHaveBeenCalledWith(dummyInstruction);
            async.done();
          });
        }));
    it(
        "should NOT call router.navigate when a link is clicked if target is set to other than _self",
        inject([AsyncTestCompleter, Router], (async, router) {
          tcb.createAsync(TestComponent).then((testComponent) {
            testComponent.detectChanges();
            testComponent.debugElement
                .query(By.css("a.detail-view-blank"))
                .triggerEventHandler("click", null);
            expect(router.spy("navigateByInstruction")).not.toHaveBeenCalled();
            async.done();
          });
        }));
  });
}

@Component(selector: "user-cmp")
@View(template: "hello {{user}}")
class UserCmp {
  String user;
  UserCmp(RouteParams params) {
    this.user = params.get("name");
  }
}

@Component(selector: "test-component")
@View(
    template: '''
    <div>
      <a [router-link]="[\'/Detail\']"
         class="detail-view">
           detail view
      </a>
      <a [router-link]="[\'/Detail\']"
         class="detail-view-self"
         target="_self">
           detail view with _self target
      </a>
      <a [router-link]="[\'/Detail\']"
         class="detail-view-blank"
         target="_blank">
           detail view with _blank target
      </a>
    </div>''',
    directives: const [RouterLink])
class TestComponent {}

makeDummyLocation() {
  var dl = new SpyLocation();
  dl.spy("prepareExternalUrl").andCallFake((url) => url);
  return dl;
}

makeDummyRouter() {
  var dr = new SpyRouter();
  dr.spy("generate").andCallFake((routeParams) => dummyInstruction);
  dr.spy("isRouteActive").andCallFake((_) => false);
  dr.spy("navigateInstruction");
  return dr;
}
