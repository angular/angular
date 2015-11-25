library angular2.test.router.path_location_strategy_spec;

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
        beforeEachProviders,
        SpyObject;
import "package:angular2/core.dart" show Injector, provide;
import "package:angular2/src/router/platform_location.dart"
    show PlatformLocation;
import "package:angular2/src/router/location_strategy.dart"
    show LocationStrategy, APP_BASE_HREF;
import "package:angular2/src/router/path_location_strategy.dart"
    show PathLocationStrategy;
import "spies.dart" show SpyPlatformLocation;

main() {
  describe("PathLocationStrategy", () {
    var platformLocation, locationStrategy;
    beforeEachProviders(() => [
          PathLocationStrategy,
          provide(PlatformLocation, useFactory: makeSpyPlatformLocation)
        ]);
    it("should throw without a base element or APP_BASE_HREF", () {
      platformLocation = new SpyPlatformLocation();
      platformLocation.pathname = "";
      platformLocation.spy("getBaseHrefFromDOM").andReturn(null);
      expect(() => new PathLocationStrategy(platformLocation)).toThrowError(
          "No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
    });
    describe("without APP_BASE_HREF", () {
      beforeEach(inject([PlatformLocation, PathLocationStrategy], (pl, ls) {
        platformLocation = pl;
        locationStrategy = ls;
      }));
      it("should prepend urls with a hash for non-empty URLs", () {
        expect(locationStrategy.prepareExternalUrl("foo")).toEqual("foo");
        locationStrategy.pushState(null, "Title", "foo", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "foo");
      });
      it("should prepend urls with a hash for URLs with query params", () {
        expect(locationStrategy.prepareExternalUrl("foo?bar"))
            .toEqual("foo?bar");
        locationStrategy.pushState(null, "Title", "foo", "bar=baz");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "foo?bar=baz");
      });
      it("should not prepend a hash to external urls for an empty internal URL",
          () {
        expect(locationStrategy.prepareExternalUrl("")).toEqual("");
        locationStrategy.pushState(null, "Title", "", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "");
      });
    });
    describe("with APP_BASE_HREF with neither leading nor trailing slash", () {
      beforeEachProviders(() => [provide(APP_BASE_HREF, useValue: "app")]);
      beforeEach(inject([PlatformLocation, PathLocationStrategy], (pl, ls) {
        platformLocation = pl;
        locationStrategy = ls;
        platformLocation.spy("pushState");
        platformLocation.pathname = "";
      }));
      it("should prepend urls with a hash for non-empty URLs", () {
        expect(locationStrategy.prepareExternalUrl("foo")).toEqual("app/foo");
        locationStrategy.pushState(null, "Title", "foo", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "app/foo");
      });
      it("should prepend urls with a hash for URLs with query params", () {
        expect(locationStrategy.prepareExternalUrl("foo?bar"))
            .toEqual("app/foo?bar");
        locationStrategy.pushState(null, "Title", "foo", "bar=baz");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "app/foo?bar=baz");
      });
      it("should not prepend a hash to external urls for an empty internal URL",
          () {
        expect(locationStrategy.prepareExternalUrl("")).toEqual("app");
        locationStrategy.pushState(null, "Title", "", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "app");
      });
    });
    describe("with APP_BASE_HREF with leading slash", () {
      beforeEachProviders(() => [provide(APP_BASE_HREF, useValue: "/app")]);
      beforeEach(inject([PlatformLocation, PathLocationStrategy], (pl, ls) {
        platformLocation = pl;
        locationStrategy = ls;
        platformLocation.spy("pushState");
        platformLocation.pathname = "";
      }));
      it("should prepend urls with a hash for non-empty URLs", () {
        expect(locationStrategy.prepareExternalUrl("foo")).toEqual("/app/foo");
        locationStrategy.pushState(null, "Title", "foo", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app/foo");
      });
      it("should prepend urls with a hash for URLs with query params", () {
        expect(locationStrategy.prepareExternalUrl("foo?bar"))
            .toEqual("/app/foo?bar");
        locationStrategy.pushState(null, "Title", "foo", "bar=baz");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app/foo?bar=baz");
      });
      it("should not prepend a hash to external urls for an empty internal URL",
          () {
        expect(locationStrategy.prepareExternalUrl("")).toEqual("/app");
        locationStrategy.pushState(null, "Title", "", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app");
      });
    });
    describe("with APP_BASE_HREF with both leading and trailing slash", () {
      beforeEachProviders(() => [provide(APP_BASE_HREF, useValue: "/app/")]);
      beforeEach(inject([PlatformLocation, PathLocationStrategy], (pl, ls) {
        platformLocation = pl;
        locationStrategy = ls;
        platformLocation.spy("pushState");
        platformLocation.pathname = "";
      }));
      it("should prepend urls with a hash for non-empty URLs", () {
        expect(locationStrategy.prepareExternalUrl("foo")).toEqual("/app/foo");
        locationStrategy.pushState(null, "Title", "foo", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app/foo");
      });
      it("should prepend urls with a hash for URLs with query params", () {
        expect(locationStrategy.prepareExternalUrl("foo?bar"))
            .toEqual("/app/foo?bar");
        locationStrategy.pushState(null, "Title", "foo", "bar=baz");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app/foo?bar=baz");
      });
      it("should not prepend a hash to external urls for an empty internal URL",
          () {
        expect(locationStrategy.prepareExternalUrl("")).toEqual("/app/");
        locationStrategy.pushState(null, "Title", "", "");
        expect(platformLocation.spy("pushState"))
            .toHaveBeenCalledWith(null, "Title", "/app/");
      });
    });
  });
}

makeSpyPlatformLocation() {
  var platformLocation = new SpyPlatformLocation();
  platformLocation.spy("getBaseHrefFromDOM").andReturn("");
  platformLocation.spy("pushState");
  platformLocation.pathname = "";
  return platformLocation;
}
