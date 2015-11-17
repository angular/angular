library angular2.test.router.location_spec;

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
        beforeEachBindings,
        SpyObject;
import "package:angular2/core.dart" show Injector, provide;
import "package:angular2/src/router/location.dart" show Location;
import "package:angular2/src/router/location_strategy.dart"
    show LocationStrategy, APP_BASE_HREF;
import "package:angular2/src/mock/mock_location_strategy.dart"
    show MockLocationStrategy;

main() {
  describe("Location", () {
    var locationStrategy, location;
    Location makeLocation(
        [String baseHref = "/my/app", dynamic provider = const []]) {
      locationStrategy = new MockLocationStrategy();
      locationStrategy.internalBaseHref = baseHref;
      var injector = Injector.resolveAndCreate([
        Location,
        provide(LocationStrategy, useValue: locationStrategy),
        provider
      ]);
      return location = injector.get(Location);
    }
    beforeEach(makeLocation);
    it("should not prepend urls with starting slash when an empty URL is provided",
        () {
      expect(location.prepareExternalUrl(""))
          .toEqual(locationStrategy.getBaseHref());
    });
    it("should not prepend path with an extra slash when a baseHref has a trailing slash",
        () {
      var location = makeLocation("/my/slashed/app/");
      expect(location.prepareExternalUrl("/page"))
          .toEqual("/my/slashed/app/page");
    });
    it("should not append urls with leading slash on navigate", () {
      location.go("/my/app/user/btford");
      expect(locationStrategy.path()).toEqual("/my/app/user/btford");
    });
    it(
        "should normalize urls on popstate",
        inject([AsyncTestCompleter], (async) {
          locationStrategy.simulatePopState("/my/app/user/btford");
          location.subscribe((ev) {
            expect(ev["url"]).toEqual("/user/btford");
            async.done();
          });
        }));
    it("should revert to the previous path when a back() operation is executed",
        () {
      var locationStrategy = new MockLocationStrategy();
      var location = new Location(locationStrategy);
      assertUrl(path) {
        expect(location.path()).toEqual(path);
      }
      location.go("/ready");
      assertUrl("/ready");
      location.go("/ready/set");
      assertUrl("/ready/set");
      location.go("/ready/set/go");
      assertUrl("/ready/set/go");
      location.back();
      assertUrl("/ready/set");
      location.back();
      assertUrl("/ready");
    });
    it("should incorporate the provided query values into the location change",
        () {
      var locationStrategy = new MockLocationStrategy();
      var location = new Location(locationStrategy);
      location.go("/home", "key=value");
      expect(location.path()).toEqual("/home?key=value");
    });
  });
}
