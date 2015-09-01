library angular2.src.web_workers.debug_tools.single_client_server_message_bus;

import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus, MessageBusSink, MessageBusSource;
import 'dart:io';
import 'dart:convert' show JSON;
import 'dart:async';
import "package:angular2/src/core/facade/async.dart" show EventEmitter;

class SingleClientServerMessageBus implements MessageBus {
  final SingleClientServerMessageBusSink sink;
  SingleClientServerMessageBusSource source;
  bool connected = false;

  SingleClientServerMessageBus(this.sink, this.source);

  SingleClientServerMessageBus.fromHttpServer(HttpServer server)
      : sink = new SingleClientServerMessageBusSink() {
    source = new SingleClientServerMessageBusSource();
    server.listen((HttpRequest request) {
      if (request.uri.path == "/ws") {
        if (!connected) {
          WebSocketTransformer.upgrade(request).then((WebSocket socket) {
            sink.setConnection(socket);

            var stream = socket.asBroadcastStream();
            source.setConnectionFromStream(stream);
            stream.listen(null, onDone: _handleDisconnect);
          }).catchError((error) {
            throw error;
            connected = false;
          });
          connected = true;
        } else {
          // refuse additional clients
          request.response.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          request.response.write("Maximum number of clients connected.");
          request.response.close();
        }
      }
    });
  }

  void _handleDisconnect() {
    sink.removeConnection();
    source.removeConnection();
    connected = false;
  }

  EventEmitter from(String channel) {
    return source.from(channel);
  }

  EventEmitter to(String channel) {
    return sink.to(channel);
  }
}

class SingleClientServerMessageBusSink implements MessageBusSink {
  final List<String> _messageBuffer = new List<String>();
  WebSocket _socket = null;
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();

  void setConnection(WebSocket webSocket) {
    _socket = webSocket;
    _sendBufferedMessages();
  }

  EventEmitter to(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      emitter.listen((message) {
        _send({'channel': channel, 'message': message});
      });
      return emitter;
    }
  }

  void removeConnection() {
    _socket = null;
  }

  void _send(dynamic message) {
    String encodedMessage = JSON.encode(message);
    if (_socket != null) {
      _socket.add(encodedMessage);
    } else {
      _messageBuffer.add(encodedMessage);
    }
  }

  void _sendBufferedMessages() {
    _messageBuffer.forEach((message) => _socket.add(message));
    _messageBuffer.clear();
  }
}

class SingleClientServerMessageBusSource implements MessageBusSource {
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();
  Stream _stream;

  SingleClientServerMessageBusSource();

  EventEmitter from(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      _channels[channel] = emitter;
      return emitter;
    }
  }

  void setConnectionFromWebSocket(WebSocket socket) {
    setConnectionFromStream(socket.asBroadcastStream());
  }

  void setConnectionFromStream(Stream stream) {
    _stream = stream;
    _stream.listen((encodedMessage) {
      var decodedMessage = decodeMessage(encodedMessage);
      var channel = decodedMessage['channel'];
      var message = decodedMessage['message'];

      if (_channels.containsKey(channel)) {
        _channels[channel].add(message);
      }
    });
  }

  void removeConnection() {
    _stream = null;
  }

  Map<String, dynamic> decodeMessage(dynamic message) {
    return JSON.decode(message);
  }
}
