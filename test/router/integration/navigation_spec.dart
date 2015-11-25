library angular2.test.router.integration.navigation_spec;

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
import "package:angular2/core.dart"
    show provide, Component, View, Injector, Inject;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/router.dart"
    show Router, RouterOutlet, RouterLink, RouteParams, RouteData, Location;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, Route, AuxRoute, AsyncRoute, Redirect;
import "util.dart" show TEST_ROUTER_PROVIDERS, RootCmp, compile;

var cmpInstanceCount;
var childCmpInstanceCount;
main() {
  describe("navigation", () {
    TestComponentBuilder tcb;
    ComponentFixture fixture;
    var rtr;
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) {
      tcb = tcBuilder;
      rtr = router;
      childCmpInstanceCount = 0;
      cmpInstanceCount = 0;
    }));
    it(
        "should work in a simple case",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) =>
                  rtr.config([new Route(path: "/test", component: HelloCmp)]))
              .then((_) => rtr.navigateByUrl("/test"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("hello");
            async.done();
          });
        }));
    it(
        "should navigate between components with different parameters",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/user/:name", component: UserCmp)]))
              .then((_) => rtr.navigateByUrl("/user/brian"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("hello brian");
          }).then((_) => rtr.navigateByUrl("/user/igor")).then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("hello igor");
            async.done();
          });
        }));
    it(
        "should navigate to child routes",
        inject([AsyncTestCompleter], (async) {
          compile(tcb, "outer { <router-outlet></router-outlet> }").then((rtc) {
            fixture = rtc;
          })
              .then((_) =>
                  rtr.config([new Route(path: "/a/...", component: ParentCmp)]))
              .then((_) => rtr.navigateByUrl("/a/b"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("outer { inner { hello } }");
            async.done();
          });
        }));
    it(
        "should navigate to child routes that capture an empty path",
        inject([AsyncTestCompleter], (async) {
          compile(tcb, "outer { <router-outlet></router-outlet> }").then((rtc) {
            fixture = rtc;
          })
              .then((_) =>
                  rtr.config([new Route(path: "/a/...", component: ParentCmp)]))
              .then((_) => rtr.navigateByUrl("/a"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("outer { inner { hello } }");
            async.done();
          });
        }));
    it(
        "should navigate to child routes of async routes",
        inject([AsyncTestCompleter], (async) {
          compile(tcb, "outer { <router-outlet></router-outlet> }").then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config(
                  [new AsyncRoute(path: "/a/...", loader: parentLoader)]))
              .then((_) => rtr.navigateByUrl("/a/b"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("outer { inner { hello } }");
            async.done();
          });
        }));
    it(
        "should reuse common parent components",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config(
                  [new Route(path: "/team/:id/...", component: TeamCmp)]))
              .then((_) => rtr.navigateByUrl("/team/angular/user/rado"))
              .then((_) {
            fixture.detectChanges();
            expect(cmpInstanceCount).toBe(1);
            expect(fixture.debugElement.nativeElement)
                .toHaveText("team angular { hello rado }");
          })
              .then((_) => rtr.navigateByUrl("/team/angular/user/victor"))
              .then((_) {
            fixture.detectChanges();
            expect(cmpInstanceCount).toBe(1);
            expect(fixture.debugElement.nativeElement)
                .toHaveText("team angular { hello victor }");
            async.done();
          });
        }));
    it(
        "should not reuse children when parent components change",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config(
                  [new Route(path: "/team/:id/...", component: TeamCmp)]))
              .then((_) => rtr.navigateByUrl("/team/angular/user/rado"))
              .then((_) {
            fixture.detectChanges();
            expect(cmpInstanceCount).toBe(1);
            expect(childCmpInstanceCount).toBe(1);
            expect(fixture.debugElement.nativeElement)
                .toHaveText("team angular { hello rado }");
          }).then((_) => rtr.navigateByUrl("/team/dart/user/rado")).then((_) {
            fixture.detectChanges();
            expect(cmpInstanceCount).toBe(2);
            expect(childCmpInstanceCount).toBe(2);
            expect(fixture.debugElement.nativeElement)
                .toHaveText("team dart { hello rado }");
            async.done();
          });
        }));
    it(
        "should inject route data into component",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config([
                    new Route(
                        path: "/route-data",
                        component: RouteDataCmp,
                        data: {"isAdmin": true})
                  ]))
              .then((_) => rtr.navigateByUrl("/route-data"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("true");
            async.done();
          });
        }));
    it(
        "should inject route data into component with AsyncRoute",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config([
                    new AsyncRoute(
                        path: "/route-data",
                        loader: asyncRouteDataCmp,
                        data: {"isAdmin": true})
                  ]))
              .then((_) => rtr.navigateByUrl("/route-data"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("true");
            async.done();
          });
        }));
    it(
        "should inject empty object if the route has no data property",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr.config([
                    new Route(
                        path: "/route-data-default", component: RouteDataCmp)
                  ]))
              .then((_) => rtr.navigateByUrl("/route-data-default"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("");
            async.done();
          });
        }));
  });
}

@Component(selector: "hello-cmp", template: '''{{greeting}}''')
class HelloCmp {
  String greeting;
  HelloCmp() {
    this.greeting = "hello";
  }
}

asyncRouteDataCmp() {
  return PromiseWrapper.resolve(RouteDataCmp);
}

@Component(selector: "data-cmp", template: '''{{myData}}''')
class RouteDataCmp {
  bool myData;
  RouteDataCmp(RouteData data) {
    this.myData = data.get("isAdmin");
  }
}

@Component(selector: "user-cmp", template: '''hello {{user}}''')
class UserCmp {
  String user;
  UserCmp(RouteParams params) {
    childCmpInstanceCount += 1;
    this.user = params.get("name");
  }
}

parentLoader() {
  return PromiseWrapper.resolve(ParentCmp);
}

@Component(
    selector: "parent-cmp",
    template: '''inner { <router-outlet></router-outlet> }''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/b", component: HelloCmp),
  const Route(path: "/", component: HelloCmp)
])
class ParentCmp {}

@Component(
    selector: "team-cmp",
    template: '''team {{id}} { <router-outlet></router-outlet> }''',
    directives: const [RouterOutlet])
@RouteConfig(const [const Route(path: "/user/:name", component: UserCmp)])
class TeamCmp {
  String id;
  TeamCmp(RouteParams params) {
    this.id = params.get("id");
    cmpInstanceCount += 1;
  }
}
