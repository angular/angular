import {isBlank, isPresent, isPromise, CONST} from 'angular2/src/facade/lang';
import {ObservableWrapper, Observable, EventEmitter} from 'angular2/src/facade/async';
import {
  Pipe,
  Injectable,
  ChangeDetectorRef,
  OnDestroy,
  PipeTransform,
  WrappedValue
} from 'angular2/core';

import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

class ObservableStrategy {
  createSubscription(async: any, updateLatestValue: any): any {
    return ObservableWrapper.subscribe(async, updateLatestValue, e => { throw e; });
  }

  dispose(subscription: any): void { ObservableWrapper.dispose(subscription); }

  onDestroy(subscription: any): void { ObservableWrapper.dispose(subscription); }
}

class PromiseStrategy {
  createSubscription(async: any, updateLatestValue: any): any {
    return async.then(updateLatestValue);
  }

  dispose(subscription: any): void {}

  onDestroy(subscription: any): void {}
}

var _promiseStrategy = new PromiseStrategy();
var _observableStrategy = new ObservableStrategy();
var __unused: Promise<any>;  // avoid unused import when Promise union types are erased

/**
 * The `async` pipe subscribes to an Observable or Promise and returns the latest value it has
 * emitted.
 * When a new value is emitted, the `async` pipe marks the component to be checked for changes.
 *
 * ### Example
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example core/pipes/ts/async_pipe/async_pipe_example.ts region='AsyncPipe'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. Every 500ms, the `time` Observable updates the view with the current time.
 *
 * ```typescript
 * ```
 */
@Pipe({name: 'async', pure: false})
@Injectable()
export class AsyncPipe implements PipeTransform, OnDestroy {
  /** @internal */
  _latestValue: Object = null;
  /** @internal */
  _latestReturnedValue: Object = null;

  /** @internal */
  _subscription: Object = null;
  /** @internal */
  _obj: Observable<any>| Promise<any>| EventEmitter<any> = null;
  private _strategy: any = null;
  /** @internal */
  public _ref: ChangeDetectorRef;
  constructor(_ref: ChangeDetectorRef) { this._ref = _ref; }

  ngOnDestroy(): void {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  transform(obj: Observable<any>| Promise<any>| EventEmitter<any>, args?: any[]): any {
    if (isBlank(this._obj)) {
      if (isPresent(obj)) {
        this._subscribe(obj);
      }
      this._latestReturnedValue = this._latestValue;
      return this._latestValue;
    }

    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }

    if (this._latestValue === this._latestReturnedValue) {
      return this._latestReturnedValue;
    } else {
      this._latestReturnedValue = this._latestValue;
      return WrappedValue.wrap(this._latestValue);
    }
  }

  /** @internal */
  _subscribe(obj: Observable<any>| Promise<any>| EventEmitter<any>): void {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(
        obj, (value: Object) => this._updateLatestValue(obj, value));
  }

  /** @internal */
  _selectStrategy(obj: Observable<any>| Promise<any>| EventEmitter<any>): any {
    if (isPromise(obj)) {
      return _promiseStrategy;
    } else if (ObservableWrapper.isObservable(obj)) {
      return _observableStrategy;
    } else {
      throw new InvalidPipeArgumentException(AsyncPipe, obj);
    }
  }

  /** @internal */
  _dispose(): void {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
  }

  /** @internal */
  _updateLatestValue(async: any, value: Object) {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
