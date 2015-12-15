library angular2.test.router.integration.bootstrap_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        beforeEachProviders,
        ddescribe,
        describe,
        expect,
        iit,
        flushMicrotasks,
        inject,
        it,
        xdescribe,
        TestComponentBuilder,
        xit;
import "package:angular2/platform/browser.dart" show bootstrap;
import "package:angular2/src/core/metadata.dart"
    show Component, Directive, View;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/console.dart" show Console;
import "package:angular2/core.dart" show provide, ViewChild, AfterViewInit;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, Route, Redirect, AuxRoute;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/router.dart"
    show
        ROUTER_PROVIDERS,
        ROUTER_PRIMARY_COMPONENT,
        RouteParams,
        Router,
        APP_BASE_HREF,
        ROUTER_DIRECTIVES,
        LocationStrategy;
import "package:angular2/src/mock/mock_location_strategy.dart"
    show MockLocationStrategy;
import "package:angular2/src/core/application_ref.dart" show ApplicationRef;
import "package:angular2/src/mock/mock_application_ref.dart"
    show MockApplicationRef;

class DummyConsole implements Console {
  log(message) {}
}

main() {
  describe("router bootstrap", () {
    beforeEachProviders(() => [
          ROUTER_PROVIDERS,
          provide(LocationStrategy, useClass: MockLocationStrategy),
          provide(ApplicationRef, useClass: MockApplicationRef)
        ]);
    // do not refactor out the `bootstrap` functionality. We still want to

    // keep this test around so we can ensure that bootstrapping a router works
    it(
        "should bootstrap a simple app",
        inject([AsyncTestCompleter], (async) {
          var fakeDoc = DOM.createHtmlDocument();
          var el = DOM.createElement("app-cmp", fakeDoc);
          DOM.appendChild(fakeDoc.body, el);
          bootstrap(AppCmp, [
            ROUTER_PROVIDERS,
            provide(ROUTER_PRIMARY_COMPONENT, useValue: AppCmp),
            provide(LocationStrategy, useClass: MockLocationStrategy),
            provide(DOCUMENT, useValue: fakeDoc),
            provide(Console, useClass: DummyConsole)
          ]).then((applicationRef) {
            var router = applicationRef.hostComponent.router;
            router.subscribe((_) {
              expect(el).toHaveText("outer { hello }");
              expect(applicationRef.hostComponent.location.path()).toEqual("");
              async.done();
            });
          });
        }));
    describe("broken app", () {
      beforeEachProviders(
          () => [provide(ROUTER_PRIMARY_COMPONENT, useValue: BrokenAppCmp)]);
      it(
          "should rethrow exceptions from component constructors",
          inject([AsyncTestCompleter, TestComponentBuilder],
              (async, TestComponentBuilder tcb) {
            tcb.createAsync(AppCmp).then((fixture) {
              var router = fixture.debugElement.componentInstance.router;
              PromiseWrapper.catchError(router.navigateByUrl("/cause-error"),
                  (error) {
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("outer { oh no }");
                expect(error).toContainError("oops!");
                async.done();
              });
            });
          }));
    });
    describe("back button app", () {
      beforeEachProviders(
          () => [provide(ROUTER_PRIMARY_COMPONENT, useValue: HierarchyAppCmp)]);
      it(
          "should change the url without pushing a new history state for back navigations",
          inject([AsyncTestCompleter, TestComponentBuilder],
              (async, TestComponentBuilder tcb) {
            tcb.createAsync(HierarchyAppCmp).then((fixture) {
              var router = fixture.debugElement.componentInstance.router;
              var position = 0;
              var flipped = false;
              var history = [
                [
                  "/parent/child",
                  "root { parent { hello } }",
                  "/super-parent/child"
                ],
                [
                  "/super-parent/child",
                  "root { super-parent { hello2 } }",
                  "/parent/child"
                ],
                ["/parent/child", "root { parent { hello } }", false]
              ];
              router.subscribe((_) {
                var location = fixture.debugElement.componentInstance.location;
                var element = fixture.debugElement.nativeElement;
                var path = location.path();
                var entry = history[position];
                expect(path).toEqual(entry[0]);
                expect(element).toHaveText(entry[1]);
                var nextUrl = entry[2];
                if (nextUrl == false) {
                  flipped = true;
                }
                if (flipped && position == 0) {
                  async.done();
                  return;
                }
                position = position + (flipped ? -1 : 1);
                if (flipped) {
                  location.back();
                } else {
                  router.navigateByUrl(nextUrl);
                }
              });
              router.navigateByUrl(history[0][0]);
            });
          }),
          1000);
    });
    describe("hierarchical app", () {
      beforeEachProviders(() {
        return [provide(ROUTER_PRIMARY_COMPONENT, useValue: HierarchyAppCmp)];
      });
      it(
          "should bootstrap an app with a hierarchy",
          inject([AsyncTestCompleter, TestComponentBuilder],
              (async, TestComponentBuilder tcb) {
            tcb.createAsync(HierarchyAppCmp).then((fixture) {
              var router = fixture.debugElement.componentInstance.router;
              router.subscribe((_) {
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("root { parent { hello } }");
                expect(fixture.debugElement.componentInstance.location.path())
                    .toEqual("/parent/child");
                async.done();
              });
              router.navigateByUrl("/parent/child");
            });
          }));
      // TODO(btford): mock out level lower than LocationStrategy once that level exists
      xdescribe("custom app base ref", () {
        beforeEachProviders(() {
          return [provide(APP_BASE_HREF, useValue: "/my/app")];
        });
        it(
            "should bootstrap",
            inject([AsyncTestCompleter, TestComponentBuilder],
                (async, TestComponentBuilder tcb) {
              tcb.createAsync(HierarchyAppCmp).then((fixture) {
                var router = fixture.debugElement.componentInstance.router;
                router.subscribe((_) {
                  expect(fixture.debugElement.nativeElement)
                      .toHaveText("root { parent { hello } }");
                  expect(fixture.debugElement.componentInstance.location.path())
                      .toEqual("/my/app/parent/child");
                  async.done();
                });
                router.navigateByUrl("/parent/child");
              });
            }));
      });
    });
    describe("querystring params app", () {
      beforeEachProviders(() {
        return [provide(ROUTER_PRIMARY_COMPONENT, useValue: QueryStringAppCmp)];
      });
      it(
          "should recognize and return querystring params with the injected RouteParams",
          inject([AsyncTestCompleter, TestComponentBuilder],
              (async, TestComponentBuilder tcb) {
            tcb.createAsync(QueryStringAppCmp).then((fixture) {
              var router = fixture.debugElement.componentInstance.router;
              router.subscribe((_) {
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("qParam = search-for-something");
                /*
                   expect(applicationRef.hostComponent.location.path())
                       .toEqual('/qs?q=search-for-something');*/
                async.done();
              });
              router.navigateByUrl("/qs?q=search-for-something");
              fixture.detectChanges();
            });
          }));
    });
    describe("retrieving components loaded via outlet via @ViewChild", () {
      TestComponentBuilder tcb = null;
      beforeEachProviders(
          () => [provide(ROUTER_PRIMARY_COMPONENT, useValue: AppCmp)]);
      beforeEach(inject([TestComponentBuilder], (testComponentBuilder) {
        tcb = testComponentBuilder;
      }));
      it(
          "should get a reference and pass data to components loaded inside of outlets",
          inject([AsyncTestCompleter], (async) {
            tcb.createAsync(AppWithViewChildren).then((fixture) {
              var appInstance = fixture.debugElement.componentInstance;
              var router = appInstance.router;
              router.subscribe((_) {
                fixture.detectChanges();
                expect(appInstance.helloCmp).toBeAnInstanceOf(HelloCmp);
                expect(appInstance.helloCmp.message).toBe("Ahoy");
                async.done();
              });
              router.navigateByUrl("/rainbow(pony)");
            });
          }));
    });
  });
}

@Component(selector: "hello-cmp", template: "hello")
class HelloCmp {
  String message;
}

@Component(selector: "hello2-cmp", template: "hello2")
class Hello2Cmp {
  String greeting;
}

@Component(
    selector: "app-cmp",
    template: '''outer { <router-outlet></router-outlet> }''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [const Route(path: "/", component: HelloCmp)])
class AppCmp {
  Router router;
  LocationStrategy location;
  AppCmp(this.router, this.location) {}
}

@Component(
    selector: "app-cmp",
    template: '''
    Hello routing!
    <router-outlet></router-outlet>
    <router-outlet name="pony"></router-outlet>''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [
  const Route(path: "/rainbow", component: HelloCmp),
  const AuxRoute(name: "pony", path: "pony", component: Hello2Cmp)
])
class AppWithViewChildren implements AfterViewInit {
  Router router;
  LocationStrategy location;
  @ViewChild(HelloCmp) HelloCmp helloCmp;
  @ViewChild(Hello2Cmp) Hello2Cmp hello2Cmp;
  AppWithViewChildren(this.router, this.location) {}
  ngAfterViewInit() {
    this.helloCmp.message = "Ahoy";
  }
}

@Component(
    selector: "parent-cmp",
    template: '''parent { <router-outlet></router-outlet> }''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [const Route(path: "/child", component: HelloCmp)])
class ParentCmp {}

@Component(
    selector: "super-parent-cmp",
    template: '''super-parent { <router-outlet></router-outlet> }''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [const Route(path: "/child", component: Hello2Cmp)])
class SuperParentCmp {}

@Component(
    selector: "app-cmp",
    template: '''root { <router-outlet></router-outlet> }''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [
  const Route(path: "/parent/...", component: ParentCmp),
  const Route(path: "/super-parent/...", component: SuperParentCmp)
])
class HierarchyAppCmp {
  Router router;
  LocationStrategy location;
  HierarchyAppCmp(this.router, this.location) {}
}

@Component(selector: "qs-cmp", template: '''qParam = {{q}}''')
class QSCmp {
  String q;
  QSCmp(RouteParams params) {
    this.q = params.get("q");
  }
}

@Component(
    selector: "app-cmp",
    template: '''<router-outlet></router-outlet>''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [const Route(path: "/qs", component: QSCmp)])
class QueryStringAppCmp {
  Router router;
  LocationStrategy location;
  QueryStringAppCmp(this.router, this.location) {}
}

@Component(selector: "oops-cmp", template: "oh no")
class BrokenCmp {
  BrokenCmp() {
    throw new BaseException("oops!");
  }
}

@Component(
    selector: "app-cmp",
    template: '''outer { <router-outlet></router-outlet> }''',
    directives: ROUTER_DIRECTIVES)
@RouteConfig(const [const Route(path: "/cause-error", component: BrokenCmp)])
class BrokenAppCmp {
  Router router;
  LocationStrategy location;
  BrokenAppCmp(this.router, this.location) {}
}
