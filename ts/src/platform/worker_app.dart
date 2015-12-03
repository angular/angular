library angular2.src.platform.worker_app;

import 'package:angular2/src/core/zone/ng_zone.dart';
import 'package:angular2/src/platform/server/webworker_adapter.dart';
import 'package:angular2/src/platform/worker_app_common.dart';
import 'package:angular2/src/web_workers/shared/isolate_message_bus.dart';
import 'dart:isolate';

setupIsolate(SendPort replyTo) {
  return (NgZone zone) {
    WebWorkerDomAdapter.makeCurrent();

    ReceivePort rPort = new ReceivePort();
    var sink = new WebWorkerMessageBusSink(replyTo, rPort);
    var source = new IsolateMessageBusSource(rPort);
    IsolateMessageBus bus = new IsolateMessageBus(sink, source);
    return genericWorkerAppProviders(bus, zone);
  };
}

class WebWorkerMessageBusSink extends IsolateMessageBusSink {
  WebWorkerMessageBusSink(SendPort sPort, ReceivePort rPort) : super(sPort) {
    sPort.send(rPort.sendPort);
  }
}
