library angular2.test.router.route_registry_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        describe,
        it,
        iit,
        ddescribe,
        expect,
        inject,
        beforeEach,
        SpyObject;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/router/route_registry.dart" show RouteRegistry;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, Route, Redirect, AuxRoute, AsyncRoute;
import "package:angular2/src/router/instruction.dart" show stringifyInstruction;
import "package:angular2/src/facade/lang.dart" show IS_DART;

main() {
  describe("RouteRegistry", () {
    var registry;
    beforeEach(() {
      registry = new RouteRegistry();
    });
    it(
        "should match the full URL",
        inject([AsyncTestCompleter], (async) {
          registry.config(
              RootHostCmp, new Route(path: "/", component: DummyCmpA));
          registry.config(
              RootHostCmp, new Route(path: "/test", component: DummyCmpB));
          registry.recognize("/test", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpB);
            async.done();
          });
        }));
    it("should generate URLs starting at the given component", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/...", component: DummyParentCmp, name: "FirstCmp"));
      expect(stringifyInstruction(
              registry.generate(["FirstCmp", "SecondCmp"], RootHostCmp)))
          .toEqual("first/second");
      expect(stringifyInstruction(
          registry.generate(["SecondCmp"], DummyParentCmp))).toEqual("second");
    });
    it("should generate URLs that account for redirects", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/...",
              component: DummyParentRedirectCmp,
              name: "FirstCmp"));
      expect(stringifyInstruction(registry.generate(["FirstCmp"], RootHostCmp)))
          .toEqual("first/second");
    });
    it("should generate URLs in a hierarchy of redirects", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/...",
              component: DummyMultipleRedirectCmp,
              name: "FirstCmp"));
      expect(stringifyInstruction(registry.generate(["FirstCmp"], RootHostCmp)))
          .toEqual("first/second/third");
    });
    it("should generate URLs with params", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/:param/...",
              component: DummyParentParamCmp,
              name: "FirstCmp"));
      var url = stringifyInstruction(registry.generate([
        "FirstCmp",
        {"param": "one"},
        "SecondCmp",
        {"param": "two"}
      ], RootHostCmp));
      expect(url).toEqual("first/one/second/two");
    });
    it("should generate params as an empty StringMap when no params are given",
        () {
      registry.config(RootHostCmp,
          new Route(path: "/test", component: DummyCmpA, name: "Test"));
      var instruction = registry.generate(["Test"], RootHostCmp);
      expect(instruction.component.params).toEqual({});
    });
    it(
        "should generate URLs of loaded components after they are loaded",
        inject([AsyncTestCompleter], (async) {
          registry.config(
              RootHostCmp,
              new AsyncRoute(
                  path: "/first/...",
                  loader: AsyncParentLoader,
                  name: "FirstCmp"));
          expect(() =>
                  registry.generate(["FirstCmp", "SecondCmp"], RootHostCmp))
              .toThrowError("Could not find route named \"SecondCmp\".");
          registry.recognize("/first/second", RootHostCmp).then((_) {
            expect(stringifyInstruction(
                    registry.generate(["FirstCmp", "SecondCmp"], RootHostCmp)))
                .toEqual("first/second");
            async.done();
          });
        }));
    it("should throw when generating a url and a parent has no config", () {
      expect(() => registry.generate(["FirstCmp", "SecondCmp"], RootHostCmp))
          .toThrowError("Component \"RootHostCmp\" has no route config.");
    });
    it(
        "should prefer static segments to dynamic",
        inject([AsyncTestCompleter], (async) {
          registry.config(
              RootHostCmp, new Route(path: "/:site", component: DummyCmpB));
          registry.config(
              RootHostCmp, new Route(path: "/home", component: DummyCmpA));
          registry.recognize("/home", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpA);
            async.done();
          });
        }));
    it(
        "should prefer dynamic segments to star",
        inject([AsyncTestCompleter], (async) {
          registry.config(
              RootHostCmp, new Route(path: "/:site", component: DummyCmpA));
          registry.config(
              RootHostCmp, new Route(path: "/*site", component: DummyCmpB));
          registry.recognize("/home", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpA);
            async.done();
          });
        }));
    it(
        "should prefer routes with more dynamic segments",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/:first/*rest", component: DummyCmpA));
          registry.config(
              RootHostCmp, new Route(path: "/*all", component: DummyCmpB));
          registry.recognize("/some/path", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpA);
            async.done();
          });
        }));
    it(
        "should prefer routes with more static segments",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/first/:second", component: DummyCmpA));
          registry.config(RootHostCmp,
              new Route(path: "/:first/:second", component: DummyCmpB));
          registry.recognize("/first/second", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpA);
            async.done();
          });
        }));
    it(
        "should prefer routes with static segments before dynamic segments",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/first/second/:third", component: DummyCmpB));
          registry.config(RootHostCmp,
              new Route(path: "/first/:second/third", component: DummyCmpA));
          registry
              .recognize("/first/second/third", RootHostCmp)
              .then((instruction) {
            expect(instruction.component.componentType).toBe(DummyCmpB);
            async.done();
          });
        }));
    it(
        "should match the full URL using child components",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/first/...", component: DummyParentCmp));
          registry.recognize("/first/second", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyParentCmp);
            expect(instruction.child.component.componentType).toBe(DummyCmpB);
            async.done();
          });
        }));
    it(
        "should match the URL using async child components",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/first/...", component: DummyAsyncCmp));
          registry.recognize("/first/second", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyAsyncCmp);
            expect(instruction.child.component.componentType).toBe(DummyCmpB);
            async.done();
          });
        }));
    it(
        "should match the URL using an async parent component",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new AsyncRoute(path: "/first/...", loader: AsyncParentLoader));
          registry.recognize("/first/second", RootHostCmp).then((instruction) {
            expect(instruction.component.componentType).toBe(DummyParentCmp);
            expect(instruction.child.component.componentType).toBe(DummyCmpB);
            async.done();
          });
        }));
    it("should throw when a parent config is missing the `...` suffix any of its children add routes",
        () {
      expect(() => registry.config(RootHostCmp,
          new Route(path: "/", component: DummyParentCmp))).toThrowError(
          "Child routes are not allowed for \"/\". Use \"...\" on the parent's route path.");
    });
    it("should throw when a parent config uses `...` suffix before the end of the route",
        () {
      expect(() => registry.config(
          RootHostCmp,
          new Route(
              path: "/home/.../fun/", component: DummyParentCmp))).toThrowError(
          "Unexpected \"...\" before the end of the path for \"home/.../fun/\".");
    });
    it("should throw if a config has a component that is not defined", () {
      expect(() => registry.config(
          RootHostCmp, new Route(path: "/", component: null))).toThrowError(
          "Component for route \"/\" is not defined, or is not a class.");
      expect(() => registry.config(
          RootHostCmp, new AuxRoute(path: "/", component: null))).toThrowError(
          "Component for route \"/\" is not defined, or is not a class.");
      // This would never happen in Dart
      if (!IS_DART) {
        expect(() => registry.config(RootHostCmp,
                new Route(path: "/", component: (((4 as dynamic)) as Type))))
            .toThrowError(
                "Component for route \"/\" is not defined, or is not a class.");
      }
    });
    it("should throw when linkParams are not terminal", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/...", component: DummyParentCmp, name: "First"));
      expect(() {
        registry.generate(["First"], RootHostCmp);
      }).toThrowError(
          "Link \"[\"First\"]\" does not resolve to a terminal or async instruction.");
    });
    it(
        "should match matrix params on child components and query params on the root component",
        inject([AsyncTestCompleter], (async) {
          registry.config(RootHostCmp,
              new Route(path: "/first/...", component: DummyParentCmp));
          registry
              .recognize("/first/second;filter=odd?comments=all", RootHostCmp)
              .then((instruction) {
            expect(instruction.component.componentType).toBe(DummyParentCmp);
            expect(instruction.component.params).toEqual({"comments": "all"});
            expect(instruction.child.component.componentType).toBe(DummyCmpB);
            expect(instruction.child.component.params)
                .toEqual({"filter": "odd"});
            async.done();
          });
        }));
    it("should generate URLs with matrix and query params", () {
      registry.config(
          RootHostCmp,
          new Route(
              path: "/first/:param/...",
              component: DummyParentParamCmp,
              name: "FirstCmp"));
      var url = stringifyInstruction(registry.generate([
        "FirstCmp",
        {"param": "one", "query": "cats"},
        "SecondCmp",
        {"param": "two", "sort": "asc"}
      ], RootHostCmp));
      expect(url).toEqual("first/one/second/two;sort=asc?query=cats");
    });
  });
}

AsyncParentLoader() {
  return PromiseWrapper.resolve(DummyParentCmp);
}

AsyncChildLoader() {
  return PromiseWrapper.resolve(DummyCmpB);
}

class RootHostCmp {}

@RouteConfig(
    const [const AsyncRoute(path: "/second", loader: AsyncChildLoader)])
class DummyAsyncCmp {}

class DummyCmpA {}

class DummyCmpB {}

@RouteConfig(const [
  const Redirect(path: "/", redirectTo: "/third"),
  const Route(path: "/third", component: DummyCmpB, name: "ThirdCmp")
])
class DummyRedirectCmp {}

@RouteConfig(const [
  const Redirect(path: "/", redirectTo: "/second"),
  const Route(
      path: "/second/...", component: DummyRedirectCmp, name: "SecondCmp")
])
class DummyMultipleRedirectCmp {}

@RouteConfig(const [
  const Redirect(path: "/", redirectTo: "/second"),
  const Route(path: "/second", component: DummyCmpB, name: "SecondCmp")
])
class DummyParentRedirectCmp {}

@RouteConfig(const [
  const Route(path: "/second", component: DummyCmpB, name: "SecondCmp")
])
class DummyParentCmp {}

@RouteConfig(const [
  const Route(path: "/second/:param", component: DummyCmpB, name: "SecondCmp")
])
class DummyParentParamCmp {}
