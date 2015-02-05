import {int} from 'facade/src/lang';
import {List} from 'facade/src/collection';
export var Promise = window.Promise;

export class PromiseWrapper {
  static resolve(obj):Promise {
    return Promise.resolve(obj);
  }

  static reject(obj):Promise {
    return Promise.reject(obj);
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
      complete: resolve,
      reject: reject
    };
  }

  static setTimeout(fn:Function, millis:int) {
    window.setTimeout(fn, millis);
  }
}
