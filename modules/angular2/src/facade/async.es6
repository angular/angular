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

export class ObservableWrapper {
  static subscribe(emitter:EventEmitter, onNext, onThrow = null, onReturn = null) {
    return emitter.observer({next: onNext, throw: onThrow, return: onReturn});
  }

  static dispose(subscription:any) {
    subscription.dispose();
  }

  static isObservable(obs):boolean {
    return obs instanceof Observable;
  }

  static callNext(emitter:EventEmitter, value:any) {
    emitter.next(value);
  }

  static callThrow(emitter:EventEmitter, error:any) {
    emitter.throw(error);
  }

  static callReturn(emitter:EventEmitter) {
    emitter.return();
  }
}

//TODO: vsavkin change to interface
export class Observable {
  observer(generator:Function){}
}

/**
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export class EventEmitter extends Observable {
  _subject:Rx.Subject;

  constructor() {
    super();
    this._subject = new Rx.Subject();
  }

  observer(generator) {
    // Rx.Scheduler.immediate and setTimeout is a workaround, so Rx works with zones.js.
    // Once https://github.com/angular/zone.js/issues/51 is fixed, the hack should be removed.
    return this._subject.observeOn(Rx.Scheduler.immediate).subscribe(
      (value) => {setTimeout(() => generator.next(value));},
      (error) => generator.throw ? generator.throw(error) : null,
      () => generator.return ? generator.return() : null
    );
  }

  toRx():Rx.Observable {
    return this._subject;
  }

  next(value) {
    this._subject.onNext(value);
  }

  throw(error) {
    this._subject.onError(error);
  }

  return(value) {
    this._subject.onCompleted();
  }
}