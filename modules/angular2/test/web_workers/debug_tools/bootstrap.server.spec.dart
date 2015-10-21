library angular2.test.web_workers.debug_tools.bootstrap;

import "package:angular2/testing_internal.dart";
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "package:angular2/web_worker/worker.dart";
import "package:angular2/src/web_workers/worker/application_common.dart";
import "../shared/web_worker_test_util.dart";
import "dart:convert";

main() {
  describe("bootstrapWebWorkerCommon", () {
    it("should bootstrap on a Dart VM", () {
      reflector.reflectionCapabilities = new ReflectionCapabilities();
      var buses = createPairedMessageBuses();
      bootstrapWebWorkerCommon(App, buses.worker);
    });
  });
}

@Component(selector: "app")
@View(template: "<p>Hello {{name}}</p>")
class App {
  String name = "Tester";
}
