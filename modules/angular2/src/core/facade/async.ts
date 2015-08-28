/// <reference path="../../../typings/rx/rx.d.ts" />

import {global, isPresent} from 'angular2/src/core/facade/lang';
import * as Rx from 'rx';

export {Promise};

export interface PromiseCompleter<R> {
  promise: Promise<R>;
  resolve: (value?: R | PromiseLike<R>) => void;
  reject: (error?: any, stackTrace?: string) => void;
}

export class PromiseWrapper {
  static resolve<T>(obj: T): Promise<T> { return Promise.resolve(obj); }

  static reject(obj: any, _): Promise<any> { return Promise.reject(obj); }

  // Note: We can't rename this method into `catch`, as this is not a valid
  // method name in Dart.
  static catchError<T>(promise: Promise<T>,
                       onError: (error: any) => T | PromiseLike<T>): Promise<T> {
    return promise.catch(onError);
  }

  static all(promises: any[]): Promise<any> {
    if (promises.length == 0) return Promise.resolve([]);
    return Promise.all(promises);
  }

  static then<T, U>(promise: Promise<T>, success: (value: T) => U | PromiseLike<U>,
                    rejection?: (error: any, stack?: any) => U | PromiseLike<U>): Promise<U> {
    return promise.then(success, rejection);
  }

  static wrap<T>(computation: () => T): Promise<T> {
    return new Promise((res, rej) => {
      try {
        res(computation());
      } catch (e) {
        rej(e);
      }
    });
  }

  static completer(): PromiseCompleter<any> {
    var resolve;
    var reject;

    var p = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    return {promise: p, resolve: resolve, reject: reject};
  }
}

export class TimerWrapper {
  static setTimeout(fn: Function, millis: number): number { return global.setTimeout(fn, millis); }
  static clearTimeout(id: number): void { global.clearTimeout(id); }

  static setInterval(fn: Function, millis: number): number {
    return global.setInterval(fn, millis);
  }
  static clearInterval(id: number): void { global.clearInterval(id); }
}

export class ObservableWrapper {
  // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
  static subscribe<T>(emitter: Observable, onNext: (value: T) => void,
                      onThrow: (exception: any) => void = null,
                      onReturn: () => void = null): Object {
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
    this._subject = new Rx.Subject<any>();
    this._immediateScheduler = (<any>Rx.Scheduler).immediate;
  }

  observer(generator: any): Rx.IDisposable {
    return this._subject.observeOn(this._immediateScheduler)
        .subscribe((value) => { setTimeout(() => generator.next(value)); },
                   (error) => generator.throw ? generator.throw(error) : null,
                   () => generator.return ? generator.return () : null);
  }

  toRx(): Rx.Observable<any> { return this._subject; }

  next(value: any) { this._subject.onNext(value); }

  throw(error: any) { this._subject.onError(error); }

  return (value?: any) { this._subject.onCompleted(); }
}
