/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../typings/rx/rx.all.d.ts" />

import {global, isPresent} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import * as Rx from 'rx';

export var Promise = (<any>global).Promise;

export class PromiseWrapper {
  static resolve(obj): Promise<any> { return Promise.resolve(obj); }

  static reject(obj, _): Promise<any> { return Promise.reject(obj); }

  // Note: We can't rename this method into `catch`, as this is not a valid
  // method name in Dart.
  static catchError<T>(promise: Promise<T>, onError: (error: any) => T | Thenable<T>): Promise<T> {
    return promise.catch(onError);
  }

  static all(promises: List<any>): Promise<any> {
    if (promises.length == 0) return Promise.resolve([]);
    return Promise.all(promises);
  }

  static then<T>(promise: Promise<T>, success: (value: any) => T | Thenable<T>,
                 rejection?: (error: any, stack?: any) => T | Thenable<T>): Promise<T> {
    return promise.then(success, rejection);
  }

  static completer() {
    var resolve;
    var reject;

    var p = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    return {promise: p, resolve: resolve, reject: reject};
  }
  static isPromise(maybePromise): boolean { return maybePromise instanceof Promise; }
}

export class TimerWrapper {
  static setTimeout(fn: Function, millis: int): int { return global.setTimeout(fn, millis); }
  static clearTimeout(id: int): void { global.clearTimeout(id); }

  static setInterval(fn: Function, millis: int): int { return global.setInterval(fn, millis); }
  static clearInterval(id: int): void { global.clearInterval(id); }
}

export class ObservableWrapper {
  static subscribe(emitter: Observable, onNext, onThrow = null, onReturn = null): Object {
    return emitter.observer({next: onNext, throw: onThrow, return: onReturn});
  }

  static isObservable(obs: any): boolean { return obs instanceof Observable; }

  static dispose(subscription: any) { subscription.dispose(); }

  static callNext(emitter: EventEmitter, value: any) { emitter.next(value); }

  static callThrow(emitter: EventEmitter, error: any) { emitter.throw(error); }

  static callReturn(emitter: EventEmitter) { emitter.return (null); }
}

// TODO: vsavkin change to interface
export class Observable {
  observer(generator: any): Object { return null; }
}

/**
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export class EventEmitter extends Observable {
  _subject: Rx.Subject<any>;
  _immediateScheduler;

  constructor() {
    super();

    // System creates a different object for import * than Typescript es5 emit.
    if (Rx.hasOwnProperty('default')) {
      this._subject = new (<any>Rx).default.Rx.Subject();
      this._immediateScheduler = (<any>Rx).default.Rx.Scheduler.immediate;
    } else {
      this._subject = new Rx.Subject<any>();
      this._immediateScheduler = (<any>Rx.Scheduler).immediate;
    }
  }

  observer(generator) {
    return this._subject.observeOn(this._immediateScheduler)
        .subscribe((value) => { setTimeout(() => generator.next(value)); },
                   (error) => generator.throw ? generator.throw(error) : null,
                   () => generator.return ? generator.return () : null);
  }

  toRx(): Rx.Observable<any> { return this._subject; }

  next(value) { this._subject.onNext(value); }

  throw(error) { this._subject.onError(error); }

  return (value?) { this._subject.onCompleted(); }
}
