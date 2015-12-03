library angular2.examples.web_workers.kitchen_sink.index;

import "package:angular2/platform/worker_render.dart";
import "package:angular2/core.dart";
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  platform([WORKER_RENDER_PLATFORM])
      .asyncApplication(initIsolate("background_index.dart"));
}
