library angular2.src.web_workers.shared.isolate_message_bus;

import 'dart:isolate';
import 'package:angular2/src/web_workers/shared/generic_message_bus.dart';

class IsolateMessageBus extends GenericMessageBus {
  IsolateMessageBus(IsolateMessageBusSink sink, IsolateMessageBusSource source)
      : super(sink, source);
}

class IsolateMessageBusSink extends GenericMessageBusSink {
  final SendPort _port;

  IsolateMessageBusSink(SendPort port) : _port = port;

  @override
  void sendMessages(List<dynamic> messages) {
    _port.send(messages);
  }
}

class IsolateMessageBusSource extends GenericMessageBusSource {
  IsolateMessageBusSource(ReceivePort port) : super(port.asBroadcastStream());

  @override
  List<dynamic> decodeMessages(dynamic messages) {
    if (messages is SendPort) {
      return null;
    }

    return messages;
  }
}
