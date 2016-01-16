library angular2.test.web_workers.worker.mock_event_emitter;

import 'dart:core';
import 'dart:async';
import "package:angular2/src/facade/async.dart";

class MockEventEmitter<T> extends EventEmitter<T> {
  final controller = new StreamController.broadcast(sync: true);

  @override
  StreamSubscription listen(void onData(dynamic line),
      {void onError(Error error), void onDone(), bool cancelOnError}) {
    return controller.stream.listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }

  @override
  void add(value) {
    controller.add(value);
  }
}
