library angular2.src.web_workers.worker;

import "package:angular2/src/web_workers/shared/isolate_message_bus.dart";
import "package:angular2/src/web_workers/worker/application_common.dart"
    show bootstrapWebWorkerCommon;
import "package:angular2/src/core/facade/async.dart" show Future;
import "package:angular2/src/core/application_ref.dart" show ApplicationRef;
import "package:angular2/src/core/facade/lang.dart" show Type, BaseException;
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
  var sink = new WebWorkerMessageBusSink(replyTo, rPort);
  var source = new IsolateMessageBusSource(rPort);
  IsolateMessageBus bus = new IsolateMessageBus(sink, source);
  return bootstrapWebWorkerCommon(
      appComponentType, bus, componentInjectableBindings);
}

class WebWorkerMessageBusSink extends IsolateMessageBusSink {
  WebWorkerMessageBusSink(SendPort sPort, ReceivePort rPort) : super(sPort) {
    sPort.send(rPort.sendPort);
  }
}
