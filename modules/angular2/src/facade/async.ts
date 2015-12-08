import {global, isPresent, noop} from 'angular2/src/facade/lang';
// We make sure promises are in a separate file so that we can use promises
// without depending on rxjs.
import {Promise} from 'angular2/src/facade/promise';
export {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/facade/promise';

import {Subject} from 'rxjs/Subject';
import {Observable as RxObservable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Operator} from 'rxjs/Operator';

import {PromiseObservable} from 'rxjs/observable/fromPromise';
import {toPromise} from 'rxjs/operator/toPromise';

export {Subject} from 'rxjs/Subject';

export namespace NodeJS {
  export interface Timer {}
}

export class TimerWrapper {
  static setTimeout(fn: (...args: any[]) => void, millis: number): NodeJS.Timer {
    return global.setTimeout(fn, millis);
  }
  static clearTimeout(id: NodeJS.Timer): void { global.clearTimeout(id); }

  static setInterval(fn: (...args: any[]) => void, millis: number): NodeJS.Timer {
    return global.setInterval(fn, millis);
  }
  static clearInterval(id: NodeJS.Timer): void { global.clearInterval(id); }
}

export class ObservableWrapper {
  // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
  static subscribe<T>(emitter: any, onNext: (value: T) => void, onError?: (exception: any) => void,
                      onComplete: () => void = () => {}): Object {
    onError = (typeof onError === "function") && onError || noop;
    onComplete = (typeof onComplete === "function") && onComplete || noop;
    return emitter.subscribe({next: onNext, error: onError, complete: onComplete});
  }

  static isObservable(obs: any): boolean { return obs instanceof RxObservable; }

  /**
   * Returns whether `obs` has any subscribers listening to events.
   */
  static hasSubscribers(obs: EventEmitter<any>): boolean { return obs.observers.length > 0; }

  static dispose(subscription: any) { subscription.unsubscribe(); }

  /**
   * @deprecated - use callEmit() instead
   */
  static callNext(emitter: EventEmitter<any>, value: any) { emitter.next(value); }

  static callEmit(emitter: EventEmitter<any>, value: any) { emitter.emit(value); }

  static callError(emitter: EventEmitter<any>, error: any) { emitter.error(error); }

  static callComplete(emitter: EventEmitter<any>) { emitter.complete(); }

  static fromPromise(promise: Promise<any>): Observable<any> {
    return PromiseObservable.create(promise);
  }

  static toPromise(obj: Observable<any>): Promise<any> { return toPromise.call(obj); }
}

/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export class EventEmitter<T> extends Subject<T> {
  /** @internal */
  _isAsync: boolean;

  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor(isAsync: boolean = true) {
    super();
    this._isAsync = isAsync;
  }

  emit(value: T) { super.next(value); }

  /**
   * @deprecated - use .emit(value) instead
   */
  next(value: any) { super.next(value); }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
    let schedulerFn;
    let errorFn = (err: any) => null;
    let completeFn = () => null;

    if (generatorOrNext && typeof generatorOrNext === 'object') {
      schedulerFn = this._isAsync ? (value) => { setTimeout(() => generatorOrNext.next(value)); } :
                                    (value) => { generatorOrNext.next(value); };

      if (generatorOrNext.error) {
        errorFn = this._isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                                  (err) => { generatorOrNext.error(err); };
      }

      if (generatorOrNext.complete) {
        completeFn = this._isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                                     () => { generatorOrNext.complete(); };
      }
    } else {
      schedulerFn = this._isAsync ? (value) => { setTimeout(() => generatorOrNext(value)); } :
                                    (value) => { generatorOrNext(value); };

      if (error) {
        errorFn =
            this._isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
      }

      if (complete) {
        completeFn =
            this._isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
      }
    }

    return super.subscribe(schedulerFn, errorFn, completeFn);
  }
}

/**
 * Allows publishing and subscribing to series of async values.
 *
 * The `Observable` class is an alias to the `Observable` returned from
 * {@link https://github.com/reactivex/rxjs}. `Observables` are a means of delivering
 * any number of values over any period of time. `Observables` can be thought of as a
 * mixture of `Promise` and `Array`. `Observables` are like `Arrays` in that they can have
 * chained combinators -- like `map`, `reduce`, and `filter` -- attached in order to
 * perform projections and transformations of data. And they are like `Promises`
 * in that they can asynchronously deliver values. But unlike a `Promise`, an
 * `Observable` can emit many values over time, and decides if/when it is completed.
 *
 * `Observable` is also being considered for inclusion in the
 * [ECMAScript spec](https://github.com/zenparsing/es-observable).
 *
 * ## Example
 *
 * A simple example of using an `Observable` is a timer `Observable`, which will
 * notify an `Observer` each time an interval has completed.
 *
 * {@example facade/ts/async/observable.ts region='Observable'}
 *
 * The `Observable` in Angular currently doesn't provide any combinators by default.
 * So it's necessary to explicitly import any combinators that an application requires.
 * There are two ways to import RxJS combinators: pure and patched. The "pure" approach
 * involves importing a combinator as a function every place that an application needs it,
 * then calling the function with the source observable as the context of the function.
 *
 * ## Example
 *
 * {@example facade/ts/async/observable_pure.ts region='Observable'}
 *
 * The "patched" approach to using combinators is to import a special module for
 * each combinator, which will automatically cause the combinator to be patched
 * to the `Observable` prototype, which will make it available to use anywhere in
 * an application after the combinator has been imported once.
 *
 * ## Example
 *
 * (Notice the extra "add" in the path to import `map`)
 *
 * {@example facade/ts/async/observable_patched.ts region='Observable'}
 *
 * Notice that the sequence of operations is now able to be expressed "left-to-right"
 * because `map` is on the `Observable` prototype. For a simple example like this one,
 * the left-to-right expression may seem insignificant. However, when several operators
 * are used in combination, the "callback tree" grows several levels deep, and becomes
 * difficult to read. For this reason, the "patched" approach is the recommended approach
 * to add new operators to `Observable`.
 *
 * For applications that are less sensitive about payload size, the set of core operators
 * can be patched onto the `Observable` prototype with a single import, by importing the
 * `rxjs` module.
 *
 * {@example facade/ts/async/observable_all.ts region='Observable'}
 *
 * Full documentation on RxJS `Observable` and available combinators can be found
 * in the RxJS [Observable docs](http://reactivex.io/RxJS/class/es6/Observable.js~Observable.html).
 *
 */
// todo(robwormald): ts2dart should handle this properly
export class Observable<T> extends RxObservable<T> {
  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
