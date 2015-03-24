library angular.core.facade.async;

import 'dart:async';
export 'dart:async' show Future, Stream, StreamController, StreamSubscription;

class PromiseWrapper {
  static Future resolve(obj) => new Future.value(obj);

  static Future reject(obj) => new Future.error(obj);

  static Future<List> all(List<Future> promises) => Future.wait(promises);

  static Future then(Future promise, success(value), Function onError) {
    if (success == null) return promise.catchError(onError);
    return promise.then(success, onError: onError);
  }

  // Note: We can't rename this method to `catch`, as this is not a valid
  // method name in Dart.
  static Future catchError(Future promise, Function onError) {
    return promise.catchError(onError);
  }

  static _Completer completer() => new _Completer(new Completer());

  static void setTimeout(fn(), int millis) {
    new Timer(new Duration(milliseconds: millis), fn);
  }

  static bool isPromise(maybePromise) {
    return maybePromise is Future;
  }
}

class ObservableWrapper {
  static StreamSubscription subscribe(Stream s, Function onNext, [onError, onComplete]) {
    return s.listen(onNext, onError: onError, onDone: onComplete, cancelOnError: true);
  }

  static StreamController createController() {
    return new StreamController.broadcast();
  }

  static Stream createObservable(StreamController controller) {
    return controller.stream;
  }

  static void callNext(StreamController controller, value) {
    controller.add(value);
  }

  static void callThrow(StreamController controller, error) {
    controller.addError(error);
  }

  static void callReturn(StreamController controller) {
    controller.close();
  }
}

class _Completer {
  final Completer c;

  _Completer(this.c);

  Future get promise => c.future;

  void resolve(v) {
    c.complete(v);
  }

  void reject(v) {
    c.completeError(v);
  }
}
