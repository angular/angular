library angular2.src.web_workers.ui;

import 'dart:isolate';
import 'dart:async';
import 'dart:core';
import 'package:angular2/src/web-workers/shared/message_bus.dart'
    show MessageBus, MessageBusSink, MessageBusSource;
import 'package:angular2/src/web-workers/ui/impl.dart' show bootstrapUICommon;

/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the bootstrapping process
 */
Future<MessageBus> bootstrap(String uri) {
  return spawnWebWorker(Uri.parse(uri)).then((bus) {
    bootstrapUICommon(bus);
    return bus;
  });
}

/**
 * To be called from the main thread to spawn and communicate with the worker thread
 */
Future<UIMessageBus> spawnWebWorker(Uri uri) {
  var receivePort = new ReceivePort();
  var isolateEndSendPort = receivePort.sendPort;
  return Isolate.spawnUri(uri, const [], isolateEndSendPort).then((_) {
    var source = new UIMessageBusSource(receivePort);
    return source.sink.then((sendPort) {
      var sink = new UIMessageBusSink(sendPort);
      return new UIMessageBus(sink, source);
    });
  });
}

class UIMessageBus extends MessageBus {
  final UIMessageBusSink sink;
  final UIMessageBusSource source;

  UIMessageBus(UIMessageBusSink sink, UIMessageBusSource source)
      : sink = sink,
        source = source;
}

class UIMessageBusSink extends MessageBusSink {
  final SendPort _port;

  UIMessageBusSink(SendPort port) : _port = port;

  void send(message) {
    _port.send(message);
  }
}

class UIMessageBusSource extends MessageBusSource {
  final ReceivePort _port;
  final Stream rawDataStream;
  Map<int, StreamSubscription> _listenerStore =
      new Map<int, StreamSubscription>();
  int _numListeners = 0;

  UIMessageBusSource(ReceivePort port)
      : _port = port,
        rawDataStream = port.asBroadcastStream();

  Future<SendPort> get sink => rawDataStream.firstWhere((message) {
        return message is SendPort;
      });

  int addListener(Function fn) {
    var subscription = rawDataStream.listen((message) {
      fn({"data": message});
    });

    _listenerStore[++_numListeners] = subscription;
    return _numListeners;
  }

  void removeListener(int index) {
    _listenerStore[index].cancel();
    _listenerStore.remove(index);
  }
}
