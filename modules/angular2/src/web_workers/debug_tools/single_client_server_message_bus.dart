library angular2.src.web_workers.debug_tools.single_client_server_message_bus;

import 'dart:io';
import 'dart:convert' show JSON;
import 'package:angular2/src/web_workers/shared/generic_message_bus.dart';

class SingleClientServerMessageBus extends GenericMessageBus {
  bool connected = false;

  @override
  SingleClientServerMessageBusSink get sink => super.sink;
  @override
  SingleClientServerMessageBusSource get source => super.source;

  SingleClientServerMessageBus(SingleClientServerMessageBusSink sink,
      SingleClientServerMessageBusSource source)
      : super(sink, source);

  SingleClientServerMessageBus.fromHttpServer(HttpServer server)
      : super(new SingleClientServerMessageBusSink(),
            new SingleClientServerMessageBusSource()) {
    server.listen((HttpRequest request) {
      if (request.uri.path == "/ws") {
        if (!connected) {
          WebSocketTransformer.upgrade(request).then((WebSocket socket) {
            sink.setConnection(socket);

            var stream = socket.asBroadcastStream();
            source.attachTo(stream);
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
    connected = false;
  }
}

class SingleClientServerMessageBusSink extends GenericMessageBusSink {
  final List<String> _messageBuffer = new List<String>();
  WebSocket _socket = null;

  void setConnection(WebSocket webSocket) {
    _socket = webSocket;
    _sendBufferedMessages();
  }

  void removeConnection() {
    _socket = null;
  }

  @override
  void sendMessages(List<dynamic> message) {
    String encodedMessages = JSON.encode(message);
    if (_socket != null) {
      _socket.add(encodedMessages);
    } else {
      _messageBuffer.add(encodedMessages);
    }
  }

  void _sendBufferedMessages() {
    _messageBuffer.forEach((message) => _socket.add(message));
    _messageBuffer.clear();
  }
}

class SingleClientServerMessageBusSource extends GenericMessageBusSource {
  SingleClientServerMessageBusSource() : super(null);

  @override
  List<dynamic> decodeMessages(dynamic messages) {
    return JSON.decode(messages);
  }
}
