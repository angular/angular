/// <reference path="../../../angular2/typings/rx/rx.all.d.ts" />

import {isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {Observable, ObservableWrapper} from 'angular2/src/facade/async';
import {Pipe, WrappedValue, PipeFactory} from 'angular2/src/change_detection/pipes/pipe';
import {ChangeDetectorRef} from 'angular2/src/change_detection/change_detector_ref';
import * as Rx from 'rx';

export class RxPipe extends Pipe {
  _ref: ChangeDetectorRef;

  _latestValue: Object;
  _latestReturnedValue: Object;

  _subscription: Rx.IDisposable;
  _observable: Rx.Observable<any>;

  constructor(ref: ChangeDetectorRef) {
    super();
    this._ref = ref;
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._observable = null;
  }

  supports(obs): boolean { return obs instanceof (<any>Rx).default.Rx.Observable }

  onDestroy(): void {
    if (isPresent(this._subscription)) {
      this._dispose();
    }
  }

  transform(obs: Rx.Observable<any>): any {
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

  _subscribe(obs: Rx.Observable<any>): void {
    this._observable = obs;
    this._subscription =
        obs.subscribe(value => {this._updateLatestValue(value)}, e => { throw e; });
  }

  _dispose(): void {
    this._subscription.dispose();
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
export class RxPipeFactory extends PipeFactory {
  constructor() { super(); }

  supports(obs): boolean { return obs instanceof (<any>Rx).default.Rx.Observable }

  create(cdRef): Pipe { return new RxPipe(cdRef); }
}
