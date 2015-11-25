library angular2.test.router.router_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        describe,
        proxy,
        it,
        iit,
        ddescribe,
        expect,
        inject,
        beforeEach,
        beforeEachBindings;
import "spies.dart" show SpyRouterOutlet;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, ObservableWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/router/router.dart" show Router, RootRouter;
import "package:angular2/src/mock/location_mock.dart" show SpyLocation;
import "package:angular2/src/router/location.dart" show Location;
import "package:angular2/src/router/instruction.dart" show stringifyInstruction;
import "package:angular2/src/router/route_registry.dart" show RouteRegistry;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, AsyncRoute, Route;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/core.dart" show provide;

main() {
  describe("Router", () {
    var router, location;
    beforeEachBindings(() => [
          RouteRegistry,
          DirectiveResolver,
          provide(Location, useClass: SpyLocation),
          provide(Router, useFactory: (registry, location) {
            return new RootRouter(registry, location, AppCmp);
          }, deps: [RouteRegistry, Location])
        ]);
    beforeEach(inject([Router, Location], (rtr, loc) {
      router = rtr;
      location = loc;
    }));
    it(
        "should navigate based on the initial URL state",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router.config([new Route(path: "/", component: DummyComponent)])
              .then((_) => router.registerPrimaryOutlet(outlet))
              .then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            expect(location.urlChanges).toEqual([]);
            async.done();
          });
        }));
    it(
        "should activate viewports and update URL on navigate",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router
              .registerPrimaryOutlet(outlet)
              .then((_) => router
                  .config([new Route(path: "/a", component: DummyComponent)]))
              .then((_) => router.navigateByUrl("/a"))
              .then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            expect(location.urlChanges).toEqual(["/a"]);
            async.done();
          });
        }));
    it(
        "should activate viewports and update URL when navigating via DSL",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router
              .registerPrimaryOutlet(outlet)
              .then((_) => router.config([
                    new Route(path: "/a", component: DummyComponent, name: "A")
                  ]))
              .then((_) => router.navigate(["/A"]))
              .then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            expect(location.urlChanges).toEqual(["/a"]);
            async.done();
          });
        }));
    it(
        "should not push a history change on when navigate is called with skipUrlChange",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router
              .registerPrimaryOutlet(outlet)
              .then((_) => router
                  .config([new Route(path: "/b", component: DummyComponent)]))
              .then((_) => router.navigateByUrl("/b", true))
              .then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            expect(location.urlChanges).toEqual([]);
            async.done();
          });
        }));
    it(
        "should navigate after being configured",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router
              .registerPrimaryOutlet(outlet)
              .then((_) => router.navigateByUrl("/a"))
              .then((_) {
            expect(outlet.spy("activate")).not.toHaveBeenCalled();
            return router
                .config([new Route(path: "/a", component: DummyComponent)]);
          }).then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            async.done();
          });
        }));
    it("should throw when linkParams does not include a route name", () {
      expect(() => router.generate(["./"])).toThrowError(
          '''Link "${ ListWrapper . toJSON ( [ "./" ] )}" must include a route name.''');
      expect(() => router.generate(["/"])).toThrowError(
          '''Link "${ ListWrapper . toJSON ( [ "/" ] )}" must include a route name.''');
    });
    it("should, when subscribed to, return a disposable subscription", () {
      expect(() {
        var subscription = router.subscribe((_) {});
        ObservableWrapper.dispose(subscription);
      }).not.toThrow();
    });
    it("should generate URLs from the root component when the path starts with /",
        () {
      router.config([
        new Route(
            path: "/first/...", component: DummyParentComp, name: "FirstCmp")
      ]);
      var instruction = router.generate(["/FirstCmp", "SecondCmp"]);
      expect(stringifyInstruction(instruction)).toEqual("first/second");
      instruction = router.generate(["/FirstCmp/SecondCmp"]);
      expect(stringifyInstruction(instruction)).toEqual("first/second");
    });
    it(
        "should generate an instruction with terminal async routes",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router.registerPrimaryOutlet(outlet);
          router.config([
            new AsyncRoute(path: "/first", loader: loader, name: "FirstCmp")
          ]);
          var instruction = router.generate(["/FirstCmp"]);
          router.navigateByInstruction(instruction).then((_) {
            expect(outlet.spy("activate")).toHaveBeenCalled();
            async.done();
          });
        }));
    it(
        "should return whether a given instruction is active with isRouteActive",
        inject([AsyncTestCompleter], (async) {
          var outlet = makeDummyOutlet();
          router
              .registerPrimaryOutlet(outlet)
              .then((_) => router.config([
                    new Route(path: "/a", component: DummyComponent, name: "A"),
                    new Route(path: "/b", component: DummyComponent, name: "B")
                  ]))
              .then((_) => router.navigateByUrl("/a"))
              .then((_) {
            var instruction = router.generate(["/A"]);
            var otherInstruction = router.generate(["/B"]);
            expect(router.isRouteActive(instruction)).toEqual(true);
            expect(router.isRouteActive(otherInstruction)).toEqual(false);
            async.done();
          });
        }));
    describe("query string params", () {
      it("should use query string params for the root route", () {
        router.config([
          new Route(
              path: "/hi/how/are/you",
              component: DummyComponent,
              name: "GreetingUrl")
        ]);
        var instruction = router.generate([
          "/GreetingUrl",
          {"name": "brad"}
        ]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual("hi/how/are/you?name=brad");
      });
      it("should serialize parameters that are not part of the route definition as query string params",
          () {
        router.config([
          new Route(
              path: "/one/two/:three",
              component: DummyComponent,
              name: "NumberUrl")
        ]);
        var instruction = router.generate([
          "/NumberUrl",
          {"three": "three", "four": "four"}
        ]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual("one/two/three?four=four");
      });
    });
    describe("matrix params", () {
      it("should generate matrix params for each non-root component", () {
        router.config([
          new Route(
              path: "/first/...", component: DummyParentComp, name: "FirstCmp")
        ]);
        var instruction = router.generate([
          "/FirstCmp",
          {"key": "value"},
          "SecondCmp",
          {"project": "angular"}
        ]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual("first/second;project=angular?key=value");
      });
      it("should work with named params", () {
        router.config([
          new Route(
              path: "/first/:token/...",
              component: DummyParentComp,
              name: "FirstCmp")
        ]);
        var instruction = router.generate([
          "/FirstCmp",
          {"token": "min"},
          "SecondCmp",
          {"author": "max"}
        ]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual("first/min/second;author=max");
      });
    });
  });
}

Future<Type> loader() {
  return PromiseWrapper.resolve(DummyComponent);
}

class DummyComponent {}

@RouteConfig(const [
  const Route(path: "/second", component: DummyComponent, name: "SecondCmp")
])
class DummyParentComp {}

makeDummyOutlet() {
  var ref = new SpyRouterOutlet();
  ref.spy("canActivate").andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy("canReuse").andCallFake((_) => PromiseWrapper.resolve(false));
  ref.spy("canDeactivate").andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy("activate").andCallFake((_) => PromiseWrapper.resolve(true));
  return ref;
}

class AppCmp {}
