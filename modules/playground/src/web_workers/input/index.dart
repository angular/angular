library angular2.examples.web_workers.input.index;

import "package:angular2/platform/worker_render.dart";
import "package:angular2/core.dart";

@AngularEntrypoint()
main() {
  platform([WORKER_RENDER_PLATFORM])
      .asyncApplication(initIsolate("background_index.dart"));
}
