library examples.src.web_workers.todo.background_index;

import "index_common.dart" show TodoApp;
import "dart:isolate";
import "package:angular2/src/web-workers/worker/application.dart"
    show bootstrapWebworker;
import "package:angular2/src/reflection/reflection_capabilities.dart";
import "package:angular2/src/reflection/reflection.dart";

main(List<String> args, SendPort replyTo) {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrapWebworker(replyTo, TodoApp).catchError((error) => throw error);
}
