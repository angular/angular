library angular.core.facade.async;

import 'dart:async';
export 'dart:async' show Future;

class PromiseWrapper {
  static Future resolve(obj) => new Future.value(obj);

  static Future reject(obj) => new Future.error(obj);

  static Future<List> all(List<Future> promises) => Future.wait(promises);

  static Future then(Future promise, success(value), Function onError) {
    if (success == null) return promise.catchError(onError);
    return promise.then(success, onError: onError);
  }

  static _Completer completer() => new _Completer(new Completer());

  static void setTimeout(fn(), int millis) {
    new Timer(new Duration(milliseconds: millis), fn);
  }

  static bool isPromise(maybePromise) {
    return maybePromise is Future;
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
