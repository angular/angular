import {Observable, ObservableWrapper} from 'angular2/src/facade/async';
import {isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {Pipe, WrappedValue, PipeFactory} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

/**
 * Implements async bindings to Observable.
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
 *   changeDetection: ON_PUSH
 * })
 * @View({
 *   template: "Task Description {{ description | async }}"
 * })
 * class Task {
 *  description:Observable<string>;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
export class ObservablePipe extends Pipe {
  _ref: ChangeDetectorRef;

  _latestValue: Object;
  _latestReturnedValue: Object;

  _subscription: Object;
  _observable: Observable;

  constructor(ref: ChangeDetectorRef) {
    super();
    this._ref = ref;
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._observable = null;
  }

  supports(obs): boolean { return ObservableWrapper.isObservable(obs); }

  onDestroy(): void {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  transform(obs: Observable): any {
    if (isBlank(this._subscription)) {
      this._subscribe(obs);
      return null;
    }

    if (obs !== this._observable) {
      this._dispose();
      return this.transform(obs);
    }

    if (this._latestValue === this._latestReturnedValue) {
      return this._latestReturnedValue;
    } else {
      this._latestReturnedValue = this._latestValue;
      return WrappedValue.wrap(this._latestValue);
    }
  }

  _subscribe(obs: Observable): void {
    this._observable = obs;
    this._subscription = ObservableWrapper.subscribe(obs, value => {this._updateLatestValue(value)},
                                                     e => { throw e; });
  }

  _dispose(): void {
    ObservableWrapper.dispose(this._subscription);
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._observable = null;
  }

  _updateLatestValue(value: Object) {
    this._latestValue = value;
    this._ref.requestCheck();
  }
}

/**
 * Provides a factory for [ObervablePipe].
 *
 * @exportedAs angular2/pipes
 */
@CONST()
export class ObservablePipeFactory extends PipeFactory {
  constructor() { super(); }

  supports(obs): boolean { return ObservableWrapper.isObservable(obs); }

  create(cdRef): Pipe { return new ObservablePipe(cdRef); }
}