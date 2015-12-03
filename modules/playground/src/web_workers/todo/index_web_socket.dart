library angular2.examples.web_workers.todo.index_web_socket;

import "package:angular2/src/core/reflection/reflection_capabilities.dart";
import "package:angular2/src/core/reflection/reflection.dart";
import "package:angular2/core.dart";
import "package:angular2/platform/worker_render.dart";
import "package:angular2/src/web_workers/debug_tools/web_socket_message_bus.dart";
import 'dart:html' show WebSocket;

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var webSocket = new WebSocket("ws://127.0.0.1:1337/ws");
  webSocket.onOpen.listen((e) {
    var bus = new WebSocketMessageBus.fromWebSocket(webSocket);

    platform([WORKER_RENDER_PLATFORM])
    .application([WORKER_RENDER_APP_COMMON, new Provider(MessageBus, useValue: bus),
      new Provider(APP_INITIALIZER, 
        useFactory: (injector) => () => initializeGenericWorkerRenderer(injector),
        deps: [Injector],
        multi: true
      )
    ]);
  });
}
