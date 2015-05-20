import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {Pipe, WrappedValue} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

/**
 * Implements async bindings to Promise.
 *
 * # Example
 *
 * In this example we bind the description promise to the DOM.
 * The async pipe will convert a promise to the value with which it is resolved. It will also
 * request a change detection check when the promise is resolved.
 *
 *  ```
 * @Component({
 *   selector: "task-cmp",
 *   changeDetection: ON_PUSH
 * })
 * @View({
 *   template: "Task Description {{ description | async }}"
 * })
 * class Task {
 *   description:Promise<string>;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
export class PromisePipe extends Pipe {
  _ref: ChangeDetectorRef;
  _latestValue: Object;
  _latestReturnedValue: Object;
  _sourcePromise: Promise<any>;

  constructor(ref: ChangeDetectorRef) {
    super();
    this._ref = ref;
    this._latestValue = null;
    this._latestReturnedValue = null;
  }

  supports(promise): boolean { return PromiseWrapper.isPromise(promise); }

  onDestroy(): void {
    if (isPresent(this._sourcePromise)) {
      this._latestValue = null;
      this._latestReturnedValue = null;
      this._sourcePromise = null;
    }
  }

  transform(promise: Promise<any>): any {
    if (isBlank(this._sourcePromise)) {
      this._sourcePromise = promise;
      promise.then((val) => {
        if (this._sourcePromise === promise) {
          this._updateLatestValue(val);
        }
      });
      return null;
    }

    if (promise !== this._sourcePromise) {
      this._sourcePromise = null;
      return this.transform(promise);
    }

    if (this._latestValue === this._latestReturnedValue) {
      return this._latestReturnedValue;
    } else {
      this._latestReturnedValue = this._latestValue;
      return WrappedValue.wrap(this._latestValue);
    }
  }

  _updateLatestValue(value: Object) {
    this._latestValue = value;
    this._ref.requestCheck();
  }
}

/**
 * Provides a factory for [PromisePipe].
 *
 * @exportedAs angular2/pipes
 */
export class PromisePipeFactory {
  supports(promise): boolean { return PromiseWrapper.isPromise(promise); }

  create(cdRef): Pipe { return new PromisePipe(cdRef); }
}
