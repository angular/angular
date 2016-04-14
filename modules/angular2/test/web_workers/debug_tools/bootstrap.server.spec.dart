library angular2.test.web_workers.debug_tools.bootstrap;

import 'package:angular2/src/platform/server/html_adapter.dart';
import "package:angular2/src/testing/testing_internal_core.dart";
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "package:angular2/src/platform/worker_app_common.dart"
    show WORKER_APP_APPLICATION_COMMON;
import "package:angular2/platform/worker_app.dart" show WORKER_APP_PLATFORM;
import "package:angular2/core.dart";
import "../shared/web_worker_test_util.dart";
import "dart:convert";

main() {
  Html5LibDomAdapter.makeCurrent();
  testSetup();

  describe("WORKER_APP_COMMON_PROVIDERS", () {
    it("should be able to load in a Dart VM", () {
      reflector.reflectionCapabilities = new ReflectionCapabilities();
      var buses = createPairedMessageBuses();
      disposePlatform();
      var platform = createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_APP_PLATFORM));
      var appInjector = ReflectiveInjector.resolveAndCreate(WORKER_APP_APPLICATION_COMMON,
          platform.injector);
      appInjector.get(ApplicationRef);
    });
  });
}
