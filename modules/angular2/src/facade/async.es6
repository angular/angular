import {int, global, isPresent} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import Rx from 'rx/dist/rx.all';

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


/**
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export var Observable = Rx.Observable;
export var ObservableController = Rx.Subject;

export class ObservableWrapper {
  static createController():Rx.Subject {
    return new Rx.Subject();
  }

  static createObservable(subject:Rx.Subject):Observable {
    return subject;
  }

  static subscribe(observable:Observable, generatorOrOnNext, onThrow = null, onReturn = null) {
    if (isPresent(generatorOrOnNext.next)) {
      return observable.observeOn(Rx.Scheduler.timeout).subscribe(
        (value) => generatorOrOnNext.next(value),
        (error) => generatorOrOnNext.throw(error),
        () => generatorOrOnNext.return()
      );
    } else {
      return observable.observeOn(Rx.Scheduler.timeout).subscribe(generatorOrOnNext, onThrow, onReturn);
    }
  }

  static callNext(subject:Rx.Subject, value:any) {
    subject.onNext(value);
  }

  static callThrow(subject:Rx.Subject, error:any) {
    subject.onError(error);
  }

  static callReturn(subject:Rx.Subject) {
    subject.onCompleted();
  }
}