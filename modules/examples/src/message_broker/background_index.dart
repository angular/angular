library angular2.examples.message_broker.background_index;

import "package:angular2/src/web-workers/worker/application.dart"
    show WorkerMessageBus, WorkerMessageBusSource, WorkerMessageBusSink;
import "package:angular2/src/web-workers/worker/broker.dart"
    show MessageBroker, UiArguments;
import "package:angular2/src/web-workers/shared/serializer.dart"
    show Serializer;

import "dart:isolate";

main(List<String> args, SendPort replyTo) {
  ReceivePort rPort = new ReceivePort();
  WorkerMessageBus bus = new WorkerMessageBus.fromPorts(replyTo, rPort);
  bus.source.addListener((message) {
    if (identical(message['data']['type'], "echo")) {
      bus.sink
          .send({"type": "echo_response", "value": message['data']['value']});
    }
  });

  MessageBroker broker =
      new MessageBroker(bus, new Serializer(null, null, null), null);
  var args = new UiArguments("test", "tester");
  broker.runOnUiThread(args, String).then((data) {
    bus.sink.send({"type": "result", "value": data});
  });
}
