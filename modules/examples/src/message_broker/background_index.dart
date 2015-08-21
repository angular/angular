library angular2.examples.message_broker.background_index;

import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBroker, UiArguments;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/isolate_message_bus.dart";
import "package:angular2/src/web_workers/worker/application.dart"
    show WebWorkerMessageBusSink;
import "package:angular2/src/facade/async.dart";
import "dart:isolate";

main(List<String> args, SendPort replyTo) {
  ReceivePort rPort = new ReceivePort();
  var sink = new WebWorkerMessageBusSink(replyTo, rPort);
  var source = new IsolateMessageBusSource(rPort);
  IsolateMessageBus bus = new IsolateMessageBus(sink, source);

  ObservableWrapper.subscribe(bus.from("echo"), (value) {
    ObservableWrapper.callNext(bus.to("echo"), value);
  });

  ClientMessageBroker broker =
      new ClientMessageBroker(bus, new Serializer(null, null, null), "test");
  var args = new UiArguments("tester");
  broker.runOnUiThread(args, String).then((data) {
    ObservableWrapper.callNext(bus.to("result"), data);
  });
}
