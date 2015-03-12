import {int, global} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

export var Promise = global.Promise;

export class PromiseWrapper {
  static resolve(obj):Promise {
    return Promise.resolve(obj);
  }

  static reject(obj):Promise {
    return Promise.reject(obj);
  }

  // Note: We can't rename this method into `catch`, as this is not a valid
  // method name in Dart.
  static catchError(promise:Promise, onError:Function):Promise {
    return promise.catch(onError);
  }

  static all(promises:List):Promise {
    if (promises.length == 0) return Promise.resolve([]);
    return Promise.all(promises);
  }

  static then(promise:Promise, success:Function, rejection:Function):Promise {
    return promise.then(success, rejection);
  }

  static completer() {
    var resolve;
    var reject;

    var p = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    return {
      promise: p,
      resolve: resolve,
      reject: reject
    };
  }

  static setTimeout(fn:Function, millis:int) {
    global.setTimeout(fn, millis);
  }

  static isPromise(maybePromise):boolean {
    return maybePromise instanceof Promise;
  }
}
