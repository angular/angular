library angular2.test.web_workers.worker.mock_event_emitter;

import 'dart:core';
import 'dart:async';
import "package:angular2/src/core/facade/async.dart";

class MockEventEmitter extends EventEmitter {
  List<Function> _nextFns = new List();

  @override
  StreamSubscription listen(void onData(dynamic line),
      {void onError(Error error), void onDone(), bool cancelOnError}) {
    _nextFns.add(onData);
    return null;
  }

  @override
  void add(value) {
    _nextFns.forEach((fn) => fn(value));
  }
}
