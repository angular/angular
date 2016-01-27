library angular2.test.web_workers.worker.platform_location_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        beforeEachProviders;
import "spies.dart" show SpyMessageBroker;
import "package:angular2/src/web_workers/worker/platform_location.dart"
    show WebWorkerPlatformLocation;
import "package:angular2/src/web_workers/shared/serialized_types.dart"
    show LocationType;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "../shared/web_worker_test_util.dart"
    show createPairedMessageBuses, MockMessageBrokerFactory, expectBrokerCall;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show UiArguments;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;

main() {
  describe("WebWorkerPlatformLocation", () {
    MessageBus uiBus = null;
    MessageBus workerBus = null;
    dynamic broker = null;
    var TEST_LOCATION = new LocationType(
        "http://www.example.com",
        "http",
        "example.com",
        "example.com",
        "80",
        "/",
        "",
        "",
        "http://www.example.com");
    WebWorkerPlatformLocation createWebWorkerPlatformLocation(
        LocationType loc) {
      broker
          .spy("runOnService")
          .andCallFake((UiArguments args, Type returnType) {
        if (identical(args.method, "getLocation")) {
          return PromiseWrapper.resolve(loc);
        }
      });
      var factory = new MockMessageBrokerFactory(broker);
      return new WebWorkerPlatformLocation(factory, workerBus, null);
    }
    testPushOrReplaceState(bool pushState) {
      var platformLocation = createWebWorkerPlatformLocation(null);
      const TITLE = "foo";
      const URL = "http://www.example.com/foo";
      expectBrokerCall(
          broker, pushState ? "pushState" : "replaceState", [null, TITLE, URL]);
      if (pushState) {
        platformLocation.pushState(null, TITLE, URL);
      } else {
        platformLocation.replaceState(null, TITLE, URL);
      }
    }
    beforeEach(() {
      var buses = createPairedMessageBuses();
      uiBus = buses.ui;
      workerBus = buses.worker;
      workerBus.initChannel("ng-Router");
      uiBus.initChannel("ng-Router");
      broker = new SpyMessageBroker();
    });
    it("should throw if getBaseHrefFromDOM is called", () {
      var platformLocation = createWebWorkerPlatformLocation(null);
      expect(() => platformLocation.getBaseHrefFromDOM()).toThrowError();
    });
    it("should get location on init", () {
      var platformLocation = createWebWorkerPlatformLocation(null);
      expectBrokerCall(broker, "getLocation");
      platformLocation.init();
    });
    it("should throw if set pathname is called before init finishes", () {
      var platformLocation = createWebWorkerPlatformLocation(null);
      platformLocation.init();
      expect(() => platformLocation.pathname = "TEST").toThrowError();
    });
    it(
        "should send pathname to render thread",
        inject([AsyncTestCompleter], (async) {
          var platformLocation = createWebWorkerPlatformLocation(TEST_LOCATION);
          platformLocation.init().then((_) {
            var PATHNAME = "/test";
            expectBrokerCall(broker, "setPathname", [PATHNAME]);
            platformLocation.pathname = PATHNAME;
            async.done();
          });
        }));
    it("should send pushState to render thread", () {
      testPushOrReplaceState(true);
    });
    it("should send replaceState to render thread", () {
      testPushOrReplaceState(false);
    });
  });
}
