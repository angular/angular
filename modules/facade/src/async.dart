library angular.core.facade.async;

import 'dart:async';
export 'dart:async' show Future;

class PromiseWrapper {
  static Future resolve(obj) {
    return new Future.value(obj);
  }

  static Future reject(obj) {
    return new Future.error(obj);
  }

  static Future all(List<Future> promises){
    return Future.wait(promises);
  }

  static Future then(Future promise, Function success, Function onError){
    return promise.then(success, onError: onError);
  }
}
