library angular.core.facade.async;

import 'dart:async';
export 'dart:async' show Future;

class FutureWrapper {
  static Future value(obj) {
    return new Future.value(obj);
  }

  static Future error(obj) {
    return new Future.error(obj);
  }

  static Future wait(List<Future> futures){
    return Future.wait(futures);
  }

  static Future catchError(Future future, Function onError){
    return future.catchError(onError);
  }
}
