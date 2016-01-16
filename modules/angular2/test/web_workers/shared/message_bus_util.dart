library angular2.test.web_workers.shared.message_bus_util;

import 'dart:isolate';
import 'package:angular2/src/web_workers/shared/message_bus.dart'
    show MessageBus;
import 'package:angular2/src/web_workers/shared/isolate_message_bus.dart';

/*
 * Returns an IsolateMessageBus thats sink is connected to its own source.
 * Useful for testing the sink and source.
 */
MessageBus createConnectedMessageBus() {
  var receivePort = new ReceivePort();
  var sendPort = receivePort.sendPort;

  var sink = new IsolateMessageBusSink(sendPort);
  var source = new IsolateMessageBusSource(receivePort);

  return new IsolateMessageBus(sink, source);
}
