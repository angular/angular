library angular2.src.web_workers.ui;

import 'dart:isolate';
import 'dart:async';
import 'dart:core';
import 'package:angular2/src/web_workers/shared/message_bus.dart'
    show MessageBus;
import 'package:angular2/src/web_workers/ui/impl.dart' show bootstrapUICommon;
import 'package:angular2/src/web_workers/shared/isolate_message_bus.dart';

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
Future<MessageBus> spawnWebWorker(Uri uri) {
  var receivePort = new ReceivePort();
  var isolateEndSendPort = receivePort.sendPort;
  return Isolate.spawnUri(uri, const [], isolateEndSendPort).then((_) {
    var source = new UIMessageBusSource(receivePort);
    return source.sink.then((sendPort) {
      var sink = new IsolateMessageBusSink(sendPort);
      return new IsolateMessageBus(sink, source);
    });
  });
}

class UIMessageBusSource extends IsolateMessageBusSource {
  UIMessageBusSource(ReceivePort port) : super(port);

  Future<SendPort> get sink => rawDataStream.firstWhere((message) {
        return message is SendPort;
      });
}
