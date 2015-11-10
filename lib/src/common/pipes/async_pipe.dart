library angular2.src.common.pipes.async_pipe;

import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, isPromise;
import "package:angular2/src/facade/async.dart"
    show Future, ObservableWrapper, Stream, EventEmitter;
import "package:angular2/src/core/metadata.dart" show Pipe;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show ChangeDetectorRef, PipeOnDestroy, PipeTransform, WrappedValue;
import "invalid_pipe_argument_exception.dart" show InvalidPipeArgumentException;

class ObservableStrategy {
  dynamic createSubscription(dynamic async, dynamic updateLatestValue) {
    return ObservableWrapper.subscribe(async, updateLatestValue, (e) {
      throw e;
    });
  }

  void dispose(dynamic subscription) {
    ObservableWrapper.dispose(subscription);
  }

  void onDestroy(dynamic subscription) {
    ObservableWrapper.dispose(subscription);
  }
}

class PromiseStrategy {
  dynamic createSubscription(dynamic async, dynamic updateLatestValue) {
    return async.then(updateLatestValue);
  }

  void dispose(dynamic subscription) {}
  void onDestroy(dynamic subscription) {}
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
@Pipe(name: "async", pure: false)
@Injectable()
class AsyncPipe implements PipeTransform, PipeOnDestroy {
  /** @internal */
  Object _latestValue = null;
  /** @internal */
  Object _latestReturnedValue = null;
  /** @internal */
  Object _subscription = null;
  /** @internal */
  dynamic /* Stream < dynamic > | Future < dynamic > | EventEmitter < dynamic > */ _obj =
      null;
  dynamic _strategy = null;
  /** @internal */
  ChangeDetectorRef _ref;
  AsyncPipe(ChangeDetectorRef _ref) {
    this._ref = _ref;
  }
  void onDestroy() {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  dynamic transform(
      dynamic /* Stream < dynamic > | Future < dynamic > | EventEmitter < dynamic > */ obj,
      [List<dynamic> args]) {
    if (isBlank(this._obj)) {
      if (isPresent(obj)) {
        this._subscribe(obj);
      }
      return null;
    }
    if (!identical(obj, this._obj)) {
      this._dispose();
      return this.transform(obj);
    }
    if (identical(this._latestValue, this._latestReturnedValue)) {
      return this._latestReturnedValue;
    } else {
      this._latestReturnedValue = this._latestValue;
      return WrappedValue.wrap(this._latestValue);
    }
  }

  /** @internal */
  void _subscribe(
      dynamic /* Stream < dynamic > | Future < dynamic > | EventEmitter < dynamic > */ obj) {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(
        obj, (value) => this._updateLatestValue(obj, value));
  }

  /** @internal */
  dynamic _selectStrategy(
      dynamic /* Stream < dynamic > | Future < dynamic > | EventEmitter < dynamic > */ obj) {
    if (isPromise(obj)) {
      return _promiseStrategy;
    } else if (ObservableWrapper.isObservable(obj)) {
      return _observableStrategy;
    } else {
      throw new InvalidPipeArgumentException(AsyncPipe, obj);
    }
  }

  /** @internal */
  void _dispose() {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
  }

  /** @internal */
  _updateLatestValue(dynamic async, Object value) {
    if (identical(async, this._obj)) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
