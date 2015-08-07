library angular2.src.web_workers.worker;

import "package:angular2/src/web-workers/shared/message_bus.dart"
    show MessageBus, MessageBusSource, MessageBusSink;
import "package:angular2/src/web-workers/worker/application_common.dart"
    show bootstrapWebWorkerCommon;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/core/application.dart" show ApplicationRef;
import "package:angular2/src/facade/lang.dart" show Type, BaseException;
import "dart:isolate";
import "dart:async";
import 'dart:core';

/**
 * Bootstrapping a Webworker Application
 *
 * You instantiate the application side by calling bootstrapWebworker from your webworker index
 * script.
 * You must supply a SendPort for communicating with the UI side in order to instantiate
 * the application.
 * Other than the SendPort you can call bootstrapWebworker() exactly as you would call
 * bootstrap() in a regular Angular application
 * See the bootstrap() docs for more details.
 */
Future<ApplicationRef> bootstrapWebWorker(
    SendPort replyTo, Type appComponentType,
    [List<dynamic> componentInjectableBindings = null]) {
  ReceivePort rPort = new ReceivePort();
  WebWorkerMessageBus bus = new WebWorkerMessageBus.fromPorts(replyTo, rPort);
  return bootstrapWebWorkerCommon(
      appComponentType, bus, componentInjectableBindings);
}

class WebWorkerMessageBus extends MessageBus {
  final WebWorkerMessageBusSink sink;
  final WebWorkerMessageBusSource source;

  WebWorkerMessageBus(this.sink, this.source);

  WebWorkerMessageBus.fromPorts(SendPort sPort, ReceivePort rPort)
      : sink = new WebWorkerMessageBusSink(sPort, rPort),
        source = new WebWorkerMessageBusSource(rPort);
}

class WebWorkerMessageBusSink extends MessageBusSink {
  final SendPort _port;

  WebWorkerMessageBusSink(SendPort sPort, ReceivePort rPort) : _port = sPort {
    this.send(rPort.sendPort);
  }

  void send(dynamic message) {
    this._port.send(message);
  }
}

class WebWorkerMessageBusSource extends MessageBusSource {
  final ReceivePort _port;
  final Stream rawDataStream;
  Map<int, StreamSubscription> _listenerStore =
      new Map<int, StreamSubscription>();
  int _numListeners = 0;

  WebWorkerMessageBusSource(ReceivePort rPort)
      : _port = rPort,
        rawDataStream = rPort.asBroadcastStream();

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
