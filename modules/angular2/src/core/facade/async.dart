library angular2.core.facade.async;

import 'dart:async';
export 'dart:async' show Stream, StreamController, StreamSubscription;

export 'promise.dart';

class TimerWrapper {
  static Timer setTimeout(fn(), int millis) =>
      new Timer(new Duration(milliseconds: millis), fn);
  static void clearTimeout(Timer timer) {
    timer.cancel();
  }

  static Timer setInterval(fn(), int millis) {
    var interval = new Duration(milliseconds: millis);
    return new Timer.periodic(interval, (Timer timer) {
      fn();
    });
  }

  static void clearInterval(Timer timer) {
    timer.cancel();
  }
}

class ObservableWrapper {
  static StreamSubscription subscribe(Stream s, Function onNext,
      [onError, onComplete]) {
    return s.listen(onNext,
        onError: onError, onDone: onComplete, cancelOnError: true);
  }

  static bool isObservable(obs) {
    return obs is Stream;
  }

  static void dispose(StreamSubscription s) {
    s.cancel();
  }

  static void callNext(EventEmitter emitter, value) {
    emitter.add(value);
  }

  static void callThrow(EventEmitter emitter, error) {
    emitter.addError(error);
  }

  static void callReturn(EventEmitter emitter) {
    emitter.close();
  }
}

class EventEmitter extends Stream {
  StreamController<dynamic> _controller;

  EventEmitter() {
    _controller = new StreamController.broadcast();
  }

  StreamSubscription listen(void onData(dynamic line),
      {void onError(Error error), void onDone(), bool cancelOnError}) {
    return _controller.stream.listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }

  void add(value) {
    _controller.add(value);
  }

  void addError(error) {
    _controller.addError(error);
  }

  void close() {
    _controller.close();
  }
}
