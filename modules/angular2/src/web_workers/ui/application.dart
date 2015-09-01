library angular2.src.web_workers.ui;

import 'dart:isolate';
import 'dart:async';
import 'dart:core';
import 'package:angular2/src/web_workers/shared/message_bus.dart'
    show MessageBus;
import 'package:angular2/src/web_workers/ui/impl.dart' show bootstrapUICommon, WebWorkerApplication;
import 'package:angular2/src/web_workers/shared/isolate_message_bus.dart';

/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the bootstrapping process
 */
Future<IsolateInstance> bootstrap(String uri) async {
  var instance = await spawnWebWorker(Uri.parse(uri));
  instance.app = bootstrapUICommon(instance.bus);
  return instance;
}

/**
 * To be called from the main thread to spawn and communicate with the worker thread
 */
Future<IsolateInstance> spawnWebWorker(Uri uri) async {
  var receivePort = new ReceivePort();
  var isolateEndSendPort = receivePort.sendPort;
  var isolate = await Isolate.spawnUri(uri, const [], isolateEndSendPort);
  var source = new UIMessageBusSource(receivePort);
  var sendPort = await source.sink;
  var sink = new IsolateMessageBusSink(sendPort);
  var bus = new IsolateMessageBus(sink, source);
  return new IsolateInstance(null, isolate, bus);
}

class UIMessageBusSource extends IsolateMessageBusSource {
  UIMessageBusSource(ReceivePort port) : super(port);

  Future<SendPort> get sink => rawDataStream.firstWhere((message) {
        return message is SendPort;
      });
}

/**
 * Wrapper class that exposes the {@link WebWorkerApplication}
 * Isolate instance and underyling {@link MessageBus} for lower level message passing.
 */
class IsolateInstance {
  WebWorkerApplication app;
  final Isolate isolate;
  final MessageBus bus;

  IsolateInstance(this.app, this.isolate, this.bus);
}
