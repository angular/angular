library angular.core.facade.async;

import 'dart:async';
export 'dart:async' show Future;

class FutureWrapper {
  static Future value(obj) {
    return new Future.value(obj);
  }

  static Future wait(List<Future> futures){
    return Future.wait(futures);
  }
}
