library angular2.test.router.integration.redirect_route_spec;

import "package:angular2/testing_internal.dart"
    show
        ComponentFixture,
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit;
import "package:angular2/router.dart"
    show Router, RouterOutlet, RouterLink, RouteParams, RouteData, Location;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, Route, AuxRoute, AsyncRoute, Redirect;
import "util.dart" show TEST_ROUTER_PROVIDERS, RootCmp, compile;
import "impl/fixture_components.dart" show HelloCmp, RedirectToParentCmp;

var cmpInstanceCount;
var childCmpInstanceCount;
main() {
  describe("redirects", () {
    TestComponentBuilder tcb;
    ComponentFixture rootTC;
    var rtr;
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) {
      tcb = tcBuilder;
      rtr = router;
      childCmpInstanceCount = 0;
      cmpInstanceCount = 0;
    }));
    it(
        "should apply when navigating by URL",
        inject([AsyncTestCompleter, Location], (async, location) {
          compile(tcb).then((rtc) {
            rootTC = rtc;
          })
              .then((_) => rtr.config([
                    new Redirect(path: "/original", redirectTo: ["Hello"]),
                    new Route(
                        path: "/redirected", component: HelloCmp, name: "Hello")
                  ]))
              .then((_) => rtr.navigateByUrl("/original"))
              .then((_) {
            rootTC.detectChanges();
            expect(rootTC.debugElement.nativeElement).toHaveText("hello");
            expect(location.urlChanges).toEqual(["/redirected"]);
            async.done();
          });
        }));
    it(
        "should recognize and apply absolute redirects",
        inject([AsyncTestCompleter, Location], (async, location) {
          compile(tcb).then((rtc) {
            rootTC = rtc;
          })
              .then((_) => rtr.config([
                    new Redirect(path: "/original", redirectTo: ["/Hello"]),
                    new Route(
                        path: "/redirected", component: HelloCmp, name: "Hello")
                  ]))
              .then((_) => rtr.navigateByUrl("/original"))
              .then((_) {
            rootTC.detectChanges();
            expect(rootTC.debugElement.nativeElement).toHaveText("hello");
            expect(location.urlChanges).toEqual(["/redirected"]);
            async.done();
          });
        }));
    it(
        "should recognize and apply relative child redirects",
        inject([AsyncTestCompleter, Location], (async, location) {
          compile(tcb).then((rtc) {
            rootTC = rtc;
          })
              .then((_) => rtr.config([
                    new Redirect(path: "/original", redirectTo: ["./Hello"]),
                    new Route(
                        path: "/redirected", component: HelloCmp, name: "Hello")
                  ]))
              .then((_) => rtr.navigateByUrl("/original"))
              .then((_) {
            rootTC.detectChanges();
            expect(rootTC.debugElement.nativeElement).toHaveText("hello");
            expect(location.urlChanges).toEqual(["/redirected"]);
            async.done();
          });
        }));
    it(
        "should recognize and apply relative parent redirects",
        inject([AsyncTestCompleter, Location], (async, location) {
          compile(tcb).then((rtc) {
            rootTC = rtc;
          })
              .then((_) => rtr.config([
                    new Route(
                        path: "/original/...", component: RedirectToParentCmp),
                    new Route(
                        path: "/redirected",
                        component: HelloCmp,
                        name: "HelloSib")
                  ]))
              .then((_) => rtr.navigateByUrl("/original/child-redirect"))
              .then((_) {
            rootTC.detectChanges();
            expect(rootTC.debugElement.nativeElement).toHaveText("hello");
            expect(location.urlChanges).toEqual(["/redirected"]);
            async.done();
          });
        }));
  });
}
