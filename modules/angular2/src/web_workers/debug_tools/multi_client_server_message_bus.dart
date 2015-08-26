library angular2.src.web_workers.debug_tools.multi_client_server_message_bus;

import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus, MessageBusSink, MessageBusSource;
import 'dart:io';
import 'dart:convert' show JSON;
import 'dart:async';
import 'package:angular2/src/core/facade/async.dart' show EventEmitter;
import 'package:angular2/src/web_workers/shared/messaging_api.dart';

// TODO(jteplitz602): Remove hard coded result type and
// clear messageHistory once app is done with it #3859
class MultiClientServerMessageBus implements MessageBus {
  final MultiClientServerMessageBusSink sink;
  MultiClientServerMessageBusSource source;
  bool hasPrimary = false;

  MultiClientServerMessageBus(this.sink, this.source);

  MultiClientServerMessageBus.fromHttpServer(HttpServer server)
      : sink = new MultiClientServerMessageBusSink() {
    source = new MultiClientServerMessageBusSource(resultReceived);
    server.listen((HttpRequest request) {
      if (request.uri.path == "/ws") {
        WebSocketTransformer.upgrade(request).then((WebSocket socket) {
          var wrapper = new WebSocketWrapper(
              sink.messageHistory, sink.resultMarkers, socket);
          if (!hasPrimary) {
            wrapper.setPrimary(true);
            hasPrimary = true;
          }
          sink.addConnection(wrapper);
          source.addConnection(wrapper);

          wrapper.stream.listen(null, onDone: _handleDisconnect(wrapper));
        });
      }
    });
  }

  void resultReceived() {
    sink.resultReceived();
  }

  EventEmitter from(String channel) {
    return source.from(channel);
  }

  EventEmitter to(String channel) {
    return sink.to(channel);
  }

  Function _handleDisconnect(WebSocketWrapper wrapper) {
    return () {
      sink.removeConnection(wrapper);
      if (wrapper.isPrimary) {
        hasPrimary = false;
      }
    };
  }
}

class WebSocketWrapper {
  WebSocket socket;
  Stream stream;
  int _numResultsReceived = 0;
  bool _isPrimary = false;
  bool caughtUp = false;
  List<String> _messageHistory;
  List<int> _resultMarkers;

  WebSocketWrapper(this._messageHistory, this._resultMarkers, this.socket) {
    stream = socket.asBroadcastStream();
    stream.listen((encodedMessage) {
      var message = JSON.decode(encodedMessage)['message'];
      if (message is Map && message.containsKey("type")) {
        if (message['type'] == 'result') {
          resultReceived();
        }
      }
    });
  }

  bool get isPrimary => _isPrimary;

  void resultReceived() {
    if (!isPrimary && !caughtUp) {
      _numResultsReceived++;
      sendToMarker(_numResultsReceived);
    }
  }

  void setPrimary(bool primary) {
    _isPrimary = primary;
    if (primary) {
      caughtUp = true;
    }
  }

  // Sends up to the given result marker
  void sendToMarker(int markerIndex) {
    int numMessages;
    int curr;
    if (markerIndex >= _resultMarkers.length) {
      // we're past the final result marker so send all messages in history
      curr = (_resultMarkers.length > 0)
          ? _resultMarkers[_resultMarkers.length - 1]
          : 0;
      numMessages = _messageHistory.length - curr;
      caughtUp = true;
    } else {
      curr = (markerIndex == 0) ? 0 : _resultMarkers[markerIndex - 1];
      var end = _resultMarkers[markerIndex];
      numMessages = end - curr;
    }
    while (numMessages > 0) {
      socket.add(_messageHistory[curr]);
      curr++;
      numMessages--;
    }
  }
}

class MultiClientServerMessageBusSink implements MessageBusSink {
  final List<String> messageHistory = new List<String>();
  final Set<WebSocketWrapper> openConnections = new Set<WebSocketWrapper>();
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();
  final List<int> resultMarkers = new List<int>();

  void resultReceived() {
    resultMarkers.add(messageHistory.length);
  }

  void addConnection(WebSocketWrapper webSocket) {
    openConnections.add(webSocket);
    // send messages up to the first result marker to this socket
    webSocket.sendToMarker(0);
  }

  void removeConnection(WebSocketWrapper webSocket) {
    openConnections.remove(webSocket);
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

  void _send(dynamic message) {
    String encodedMessage = JSON.encode(message);
    openConnections.forEach((WebSocketWrapper webSocket) {
      if (webSocket.caughtUp) {
        webSocket.socket.add(encodedMessage);
      }
    });
    messageHistory.add(encodedMessage);
  }
}

class MultiClientServerMessageBusSource implements MessageBusSource {
  final Map<String, EventEmitter> _channels = new Map<String, EventEmitter>();
  Function onResultReceived;

  MultiClientServerMessageBusSource(this.onResultReceived);

  EventEmitter from(String channel) {
    if (_channels.containsKey(channel)) {
      return _channels[channel];
    } else {
      var emitter = new EventEmitter();
      _channels[channel] = emitter;
      return emitter;
    }
  }

  void addConnection(WebSocketWrapper webSocket) {
    if (webSocket.isPrimary) {
      webSocket.stream.listen((encodedMessage) {
        var decodedMessage = decodeMessage(encodedMessage);
        var channel = decodedMessage['channel'];
        var message = decodedMessage['message'];
        if (message is Map && message.containsKey("type")) {
          if (message['type'] == 'result') {
            // tell the bus that a result was received on the primary
            onResultReceived();
          }
        }

        if (_channels.containsKey(channel)) {
          _channels[channel].add(message);
        }
      });
    } else {
      webSocket.stream.listen((encodedMessage) {
        // handle events from non-primary browser
        var decodedMessage = decodeMessage(encodedMessage);
        var channel = decodedMessage['channel'];
        var message = decodedMessage['message'];
        if (_channels.containsKey(EVENT_CHANNEL) && channel == EVENT_CHANNEL) {
          _channels[channel].add(message);
        }
      });
    }
  }

  Map<String, dynamic> decodeMessage(dynamic message) {
    return JSON.decode(message);
  }
}
