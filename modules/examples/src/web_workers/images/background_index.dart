library examples.src.web_workers.images.background_index;

import "index_common.dart" show ImageDemo;
import "dart:isolate";
import "package:angular2/src/web_workers/worker/application.dart"
    show bootstrapWebWorker;
import "package:angular2/src/reflection/reflection_capabilities.dart";
import "package:angular2/src/reflection/reflection.dart";

main(List<String> args, SendPort replyTo) {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrapWebWorker(replyTo, ImageDemo).catchError((error) => throw error);
}
