library angular2.src.platform.worker_app;

import 'package:angular2/src/core/zone/ng_zone.dart';
import 'package:angular2/src/platform/server/webworker_adapter.dart';
import 'package:angular2/src/platform/worker_app_common.dart';
import 'package:angular2/core.dart';
import 'package:angular2/src/web_workers/shared/isolate_message_bus.dart';
import 'package:angular2/src/web_workers/shared/message_bus.dart';
import 'dart:isolate';

const OpaqueToken RENDER_SEND_PORT = const OpaqueToken("RenderSendPort");

const List<dynamic> WORKER_APP_APPLICATION = const [
  WORKER_APP_APPLICATION_COMMON,
  const Provider(MessageBus,
      useFactory: createMessageBus, deps: const [NgZone, RENDER_SEND_PORT]),
  const Provider(APP_INITIALIZER, useValue: setupIsolate, multi: true)
];

MessageBus createMessageBus(NgZone zone, SendPort replyTo) {
  ReceivePort rPort = new ReceivePort();
  var sink = new WebWorkerMessageBusSink(replyTo, rPort);
  var source = new IsolateMessageBusSource(rPort);
  var bus = new IsolateMessageBus(sink, source);
  bus.attachToZone(zone);
  return bus;
}

setupIsolate() {
  WebWorkerDomAdapter.makeCurrent();
}

class WebWorkerMessageBusSink extends IsolateMessageBusSink {
  WebWorkerMessageBusSink(SendPort sPort, ReceivePort rPort) : super(sPort) {
    sPort.send(rPort.sendPort);
  }
}
