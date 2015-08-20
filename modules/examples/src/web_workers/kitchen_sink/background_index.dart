library examples.src.web_workers.kitchen_sink.background_index;

import "index_common.dart" show HelloCmp;
import "dart:isolate";
import "package:angular2/src/web_workers/worker/application.dart"
    show bootstrapWebWorker;
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";

main(List<String> args, SendPort replyTo) {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrapWebWorker(replyTo, HelloCmp).catchError((error) => throw error);
}
