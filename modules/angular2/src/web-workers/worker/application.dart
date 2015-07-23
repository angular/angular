library angular2.src.web_workers.worker;

import "package:angular2/src/web-workers/shared/message_bus.dart"
    show MessageBus, MessageBusSource, MessageBusSink;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/core/application.dart" show ApplicationRef;
import "package:angular2/src/facade/lang.dart" show Type, BaseException;
import "dart:isolate";
import "dart:async";

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
Future<ApplicationRef> bootstrapWebworker(
    SendPort replyTo, Type appComponentType,
    [List<dynamic> componentInjectableBindings = null,
    Function errorReporter = null]) {
  throw new BaseException("Not implemented");
}

class WorkerMessageBus extends MessageBus {
  final WorkerMessageBusSink sink;
  final WorkerMessageBusSource source;

  WorkerMessageBus(this.sink, this.source);

  WorkerMessageBus.fromPorts(SendPort sPort, ReceivePort rPort)
      : sink = new WorkerMessageBusSink(sPort, rPort),
        source = new WorkerMessageBusSource(rPort);
}

class WorkerMessageBusSink extends MessageBusSink {
  final SendPort _port;

  WorkerMessageBusSink(SendPort sPort, ReceivePort rPort) : _port = sPort {
    this.send(rPort.sendPort);
  }

  void send(dynamic message) {
    this._port.send(message);
  }
}

class WorkerMessageBusSource extends MessageBusSource {
  final ReceivePort _port;
  final Stream rawDataStream;

  WorkerMessageBusSource(ReceivePort rPort)
      : _port = rPort,
        rawDataStream = rPort.asBroadcastStream();

  void listen(Function fn) {
    rawDataStream.listen((message) {
      fn({"data": message});
    });
  }
}
