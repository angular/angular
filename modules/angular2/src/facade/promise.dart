library angular2.core.facade.promise;

import 'dart:async';
import 'dart:async' as async;

class PromiseWrapper {
  static Future resolve(obj) => new Future.value(obj);

  static Future reject(obj, stackTrace) => new Future.error(obj,
      stackTrace != null ? stackTrace : obj is Error ? obj.stackTrace : null);

  static Future<List> all(List<dynamic> promises) {
    return Future
        .wait(promises.map((p) => p is Future ? p : new Future.value(p)));
  }

  static Future then(Future promise, success(value), [Function onError]) {
    if (success == null) return promise.catchError(onError);
    return promise.then(success, onError: onError);
  }

  static Future wrap(Function fn) {
    return new Future(fn);
  }

  // Note: We can't rename this method to `catch`, as this is not a valid
  // method name in Dart.
  static Future catchError(Future promise, Function onError) {
    return promise.catchError(onError);
  }

  static void scheduleMicrotask(fn) {
    async.scheduleMicrotask(fn);
  }

  static bool isPromise(obj) {
    return obj is Future;
  }

  static PromiseCompleter<dynamic> completer() =>
      new PromiseCompleter(new Completer());
}

class PromiseCompleter<T> {
  final Completer<T> c;

  PromiseCompleter(this.c);

  Future get promise => c.future;

  void resolve(v) {
    c.complete(v);
  }

  void reject(error, stack) {
    if (stack == null && error is Error) {
      stack = error.stackTrace;
    }
    c.completeError(error, stack);
  }
}
