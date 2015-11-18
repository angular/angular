library angular2.examples.web_workers.todo.server_index;
import "index_common.dart" show TodoApp;
import "package:angular2/src/web_workers/debug_tools/multi_client_server_message_bus.dart";
import "package:angular2/src/web_workers/worker/application_common.dart"
  show bootstrapWebWorkerCommon;
import 'dart:io';
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "package:angular2/src/platform/server/html_adapter.dart";

void main() {
  Html5LibDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  HttpServer.bind('127.0.0.1', 1337).then((HttpServer server) {
    var bus = new MultiClientServerMessageBus.fromHttpServer(server);
    bootstrapWebWorkerCommon(TodoApp, bus).catchError((error) => throw error);
    print ("Server Listening for requests on 127.0.0.1:1337");
  });
}
