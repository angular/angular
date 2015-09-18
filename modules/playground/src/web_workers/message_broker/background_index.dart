library angular2.examples.message_broker.background_index;

import "package:angular2/web_worker/worker.dart";
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "index_common.dart" show App;
import "dart:isolate";

main(List<String> args, SendPort replyTo) {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrapWebWorker(replyTo, App).catchError((error) => throw error);
}
