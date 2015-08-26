library angular2.src.web_workers.shared.isolate_message_bus;

import 'dart:isolate';
import 'dart:async';
import 'dart:core';
import 'package:angular2/src/web_workers/shared/message_bus.dart'
    show MessageBus, MessageBusSink, MessageBusSource;
import 'package:angular2/src/core/facade/async.dart';

class IsolateMessageBus implements MessageBus {
  final IsolateMessageBusSink sink;
  final IsolateMessageBusSource source;

  IsolateMessageBus(IsolateMessageBusSink sink, IsolateMessageBusSource source)
      : sink = sink,
        source = source;

  EventEmitter from(String channel) {
    return source.from(channel);
  }

  EventEmitter to(String channel) {
    return sink.to(channel);
  }
}

class IsolateMessageBusSink implements MessageBusSink {
  final SendPort _port;
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();

  IsolateMessageBusSink(SendPort port) : _port = port;

  EventEmitter to(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      emitter.listen((message) {
        _port.send({'channel': channel, 'message': message});
      });
      _channels[channel] = emitter;
      return emitter;
    }
  }
}

class IsolateMessageBusSource extends MessageBusSource {
  final Stream rawDataStream;
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();

  IsolateMessageBusSource(ReceivePort port)
      : rawDataStream = port.asBroadcastStream() {
    rawDataStream.listen((message) {
      if (message is SendPort) {
        return;
      }

      if (message.containsKey("channel")) {
        var channel = message['channel'];
        if (_channels.containsKey(channel)) {
          _channels[channel].add(message['message']);
        }
      }
    });
  }

  EventEmitter from(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      _channels[channel] = emitter;
      return emitter;
    }
  }
}
