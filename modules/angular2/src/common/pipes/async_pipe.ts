import {isBlank, isPresent, isPromise, CONST} from 'angular2/src/facade/lang';
import {Promise, ObservableWrapper, Observable, EventEmitter} from 'angular2/src/facade/async';
import {Pipe} from 'angular2/src/core/metadata';
import {Injectable} from 'angular2/src/core/di';
import {
  ChangeDetectorRef,
  PipeOnDestroy,
  PipeTransform,
  WrappedValue
} from 'angular2/src/core/change_detection';

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


/**
 * The `async` pipe subscribes to an Observable or Promise and returns the latest value it has
 * emitted.
 * When a new value is emitted, the `async` pipe marks the component to be checked for changes.
 *
 * ### Example
 * The example below binds the `time` Observable to the view. Every 500ms, the `time` Observable
 * updates the view with the current time.
 *
 * ```
 * import {Observable} from 'angular2/core';
 * @Component({
 *   selector: "task-cmp",
 *   template: "Time: {{ time | async }}"
 * })
 * class Task {
 *   time = new Observable<number>(observer => {
 *     setInterval(_ =>
 *       observer.next(new Date().getTime()), 500);
 *   });
 * }
 * ```
 */
@Pipe({name: 'async', pure: false})
@Injectable()
export class AsyncPipe implements PipeTransform, PipeOnDestroy {
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

  onDestroy(): void {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  transform(obj: Observable<any>| Promise<any>| EventEmitter<any>, args?: any[]): any {
    if (isBlank(this._obj)) {
      if (isPresent(obj)) {
        this._subscribe(obj);
      }
      return null;
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
    this._subscription =
        this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value));
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
