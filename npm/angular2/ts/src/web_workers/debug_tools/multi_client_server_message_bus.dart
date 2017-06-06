library angular2.src.web_workers.debug_tools.multi_client_server_message_bus;

import 'dart:io';
import 'dart:convert' show JSON;
import 'dart:async';
import 'package:angular2/src/web_workers/shared/messaging_api.dart';
import 'package:angular2/src/web_workers/shared/generic_message_bus.dart';

// TODO(jteplitz602): Remove hard coded result type and
// clear messageHistory once app is done with it #3859
class MultiClientServerMessageBus extends GenericMessageBus {
  bool hasPrimary = false;

  @override
  MultiClientServerMessageBusSink get sink => super.sink;
  @override
  MultiClientServerMessageBusSource get source => super.source;

  MultiClientServerMessageBus(MultiClientServerMessageBusSink sink,
      MultiClientServerMessageBusSource source)
      : super(sink, source);

  MultiClientServerMessageBus.fromHttpServer(HttpServer server)
      : super(new MultiClientServerMessageBusSink(),
            new MultiClientServerMessageBusSource()) {
    source.onResult.listen(_resultReceived);
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

  void _resultReceived(_) {
    sink.resultReceived();
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
  WebSocket _socket;
  Stream stream;
  int _numResultsReceived = 0;
  bool _isPrimary = false;
  bool caughtUp = false;
  List<String> _messageHistory;
  List<int> _resultMarkers;
  StreamController<String> _sendStream;

  WebSocketWrapper(this._messageHistory, this._resultMarkers, this._socket) {
    stream = _socket.asBroadcastStream();
    stream.listen((encodedMessage) {
      var messages = JSON.decode(encodedMessage);
      messages.forEach((data) {
        var message = data['message'];
        if (message is Map && message.containsKey("type")) {
          if (message['type'] == 'result') {
            resultReceived();
          }
        }
      });
    });

    _sendStream = new StreamController<String>();
    _socket.addStream(_sendStream.stream);
  }

  void send(String data) {
    _sendStream.add(data);
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
      send(_messageHistory[curr]);
      curr++;
      numMessages--;
    }
  }
}

class MultiClientServerMessageBusSink extends GenericMessageBusSink {
  final List<String> messageHistory = new List<String>();
  final Set<WebSocketWrapper> openConnections = new Set<WebSocketWrapper>();
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

  @override
  void sendMessages(List<dynamic> messages) {
    String encodedMessages = JSON.encode(messages);
    openConnections.forEach((WebSocketWrapper webSocket) {
      if (webSocket.caughtUp) {
        webSocket.send(encodedMessages);
      }
    });
    messageHistory.add(encodedMessages);
  }
}

class MultiClientServerMessageBusSource extends GenericMessageBusSource {
  Function onResultReceived;
  final StreamController mainController;
  final StreamController resultController = new StreamController();

  MultiClientServerMessageBusSource._(controller)
      : mainController = controller,
        super(controller.stream);

  factory MultiClientServerMessageBusSource() {
    return new MultiClientServerMessageBusSource._(
        new StreamController.broadcast());
  }

  Stream get onResult => resultController.stream;

  void addConnection(WebSocketWrapper webSocket) {
    if (webSocket.isPrimary) {
      webSocket.stream.listen((encodedMessages) {
        var decodedMessages = _decodeMessages(encodedMessages);
        decodedMessages.forEach((decodedMessage) {
          var message = decodedMessage['message'];
          if (message is Map && message.containsKey("type")) {
            if (message['type'] == 'result') {
              // tell the bus that a result was received on the primary
              resultController.add(message);
            }
          }
        });

        mainController.add(decodedMessages);
      });
    } else {
      webSocket.stream.listen((encodedMessages) {
        // handle events from non-primary connection.
        var decodedMessages = _decodeMessages(encodedMessages);
        var eventMessages = new List<Map<String, dynamic>>();
        decodedMessages.forEach((decodedMessage) {
          var channel = decodedMessage['channel'];
          if (channel == EVENT_CHANNEL) {
            eventMessages.add(decodedMessage);
          }
        });
        if (eventMessages.length > 0) {
          mainController.add(eventMessages);
        }
      });
    }
  }

  List<dynamic> _decodeMessages(dynamic messages) {
    return JSON.decode(messages);
  }

  // This is a noop for the MultiClientBus because it has to decode the JSON messages before
  // the generic bus receives them in order to check for results and forward events
  // from the non-primary connection.
  @override
  List<dynamic> decodeMessages(dynamic messages) {
    return messages;
  }
}
