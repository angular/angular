library angular2.src.web_workers.worker.web_socket_message_bus;

import 'dart:html';
import 'dart:convert' show JSON;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus, MessageBusSink, MessageBusSource;
import 'package:angular2/src/core/facade/async.dart' show EventEmitter;

class WebSocketMessageBus implements MessageBus {
  final WebSocketMessageBusSink sink;
  final WebSocketMessageBusSource source;

  WebSocketMessageBus(this.sink, this.source);

  WebSocketMessageBus.fromWebSocket(WebSocket webSocket)
      : sink = new WebSocketMessageBusSink(webSocket),
        source = new WebSocketMessageBusSource(webSocket);

  EventEmitter from(String channel) {
    return source.from(channel);
  }

  EventEmitter to(String channel) {
    return sink.to(channel);
  }
}

class WebSocketMessageBusSink implements MessageBusSink {
  final WebSocket _webSocket;
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();

  WebSocketMessageBusSink(this._webSocket);

  EventEmitter to(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      emitter.listen((message) {
        _send({'channel': channel, 'message': message});
      });
      _channels[channel] = emitter;
      return emitter;
    }
  }

  void _send(message) {
    _webSocket.send(JSON.encode(message));
  }
}

class WebSocketMessageBusSource implements MessageBusSource {
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();

  WebSocketMessageBusSource(WebSocket webSocket) {
    webSocket.onMessage.listen((MessageEvent encodedMessage) {
      var message = decodeMessage(encodedMessage.data);
      var channel = message['channel'];
      if (_channels.containsKey(channel)) {
        _channels[channel].add(message['message']);
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

  Map<String, dynamic> decodeMessage(dynamic message) {
    return JSON.decode(message);
  }
}
