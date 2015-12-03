library angular2.examples.web_workers.todo.server_index;

import "index_common.dart" show TodoApp;
import "package:angular2/src/web_workers/debug_tools/multi_client_server_message_bus.dart";
import "package:angular2/platform/worker_app.dart";
import "package:angular2/core.dart";
import 'dart:io';
import 'dart:async';
import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "package:angular2/src/platform/server/html_adapter.dart";

void main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities(); 
  platform([WORKER_APP_PLATFORM])
  .asyncApplication(initAppThread)
  .then((ref) => ref.bootstrap(TodoApp));
}

Future<dynamic> initAppThread(NgZone zone) {
  Html5LibDomAdapter.makeCurrent();
  return HttpServer.bind('127.0.0.1', 1337).then((HttpServer server) {
    print("Server Listening for requests on 127.0.0.1:1337");
    var bus = new MultiClientServerMessageBus.fromHttpServer(server);
    return genericWorkerAppProviders(bus, zone);
  });
}

