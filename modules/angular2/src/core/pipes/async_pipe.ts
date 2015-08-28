import {isBlank, isPresent, isPromise, CONST, BaseException} from 'angular2/src/core/facade/lang';
import {Observable, Promise, ObservableWrapper} from 'angular2/src/core/facade/async';
import {Injectable} from 'angular2/di';

import {PipeTransform, PipeOnDestroy, WrappedValue} from 'angular2/change_detection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';
import {ChangeDetectorRef} from 'angular2/change_detection';

import {Pipe} from '../metadata';


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
 * Implements async bindings to Observable and Promise.
 *
 * # Example
 *
 * In this example we bind the description observable to the DOM. The async pipe will convert an
 *observable to the
 * latest value it emitted. It will also request a change detection check when a new value is
 *emitted.
 *
 *  ```
 * @Component({
 *   selector: "task-cmp",
 *   changeDetection: ChangeDetectionStrategy.OnPush
 * })
 * @View({
 *   template: "Task Description {{ description | async }}"
 * })
 * class Task {
 *  description:Observable<string>;
 * }
 *
 * ```
 */
@Pipe({name: 'async'})
@Injectable()
export class AsyncPipe implements PipeTransform, PipeOnDestroy {
  _latestValue: Object = null;
  _latestReturnedValue: Object = null;

  _subscription: Object = null;
  _obj: Observable | Promise<any> = null;
  private _strategy: any = null;

  constructor(public _ref: ChangeDetectorRef) {}

  onDestroy(): void {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  transform(obj: Observable | Promise<any>, args?: any[]): any {
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

  _subscribe(obj: Observable | Promise<any>): void {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription =
        this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value));
  }

  _selectStrategy(obj: Observable | Promise<any>): any {
    if (isPromise(obj)) {
      return _promiseStrategy;
    } else if (ObservableWrapper.isObservable(obj)) {
      return _observableStrategy;
    } else {
      throw new InvalidPipeArgumentException(AsyncPipe, obj);
    }
  }

  _dispose(): void {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
  }

  _updateLatestValue(async: any, value: Object) {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
