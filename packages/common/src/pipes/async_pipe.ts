/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, EventEmitter, OnDestroy, Pipe, PipeTransform, ɵisObservable, ɵisPromise} from '@angular/core';
import {Observable, SubscriptionLike} from 'rxjs';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

interface SubscriptionStrategy<T> {
  createSubscription(async: Observable<T> | Promise<T> | EventEmitter<T>, updateLatestValue: (value: T) => void): SubscriptionLike
      |Promise<void>;
  dispose(subscription: SubscriptionLike|Promise<void>): void;
  onDestroy(subscription: SubscriptionLike|Promise<void>): void;
}

class ObservableStrategy<T> implements SubscriptionStrategy<T> {
  createSubscription(async: Observable<T>, updateLatestValue: (value: T) => void): SubscriptionLike {
    return async.subscribe({
      next: updateLatestValue,
      error: (e: any) => {
        throw e;
      }
    });
  }

  dispose(subscription: SubscriptionLike): void {
    subscription.unsubscribe();
  }

  onDestroy(subscription: SubscriptionLike): void {
    subscription.unsubscribe();
  }
}

class PromiseStrategy<T> implements SubscriptionStrategy<T> {
  createSubscription(async: Promise<T>, updateLatestValue: (v: T) => void): Promise<void> {
    return async.then(updateLatestValue, e => {
      throw e;
    });
  }

  dispose(subscription: Promise<any>): void {}

  onDestroy(subscription: Promise<any>): void {}
}

const _promiseStrategy = new PromiseStrategy();
const _observableStrategy = new ObservableStrategy();

/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks.
 *
 * @usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * @publicApi
 */
@Pipe({name: 'async', pure: false})
export class AsyncPipe<T> implements OnDestroy, PipeTransform {
  private _latestValue: T|null = null;

  private _subscription: SubscriptionLike|Promise<void>|null = null;
  private _obj: Observable<T>|Promise<T>|EventEmitter<T>|null = null;
  private _strategy: SubscriptionStrategy<T> = null!;

  constructor(private _ref: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }
  }

  transform(obj: Observable<T>|Promise<T>): T|null;
  transform(obj: null|undefined): null;
  transform(obj: Observable<T>|Promise<T>|null|undefined): T|null;
  transform(obj: Observable<T>|Promise<T>|null|undefined): T|null {
    if (!this._obj) {
      if (obj) {
        this._subscribe(obj);
      }
      return this._latestValue;
    }

    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }

    return this._latestValue;
  }

  private _subscribe(obj: Observable<T>|Promise<T>|EventEmitter<T>): void {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(
        obj, (value) => this._updateLatestValue(obj, value));
  }

  private _selectStrategy(obj: Observable<T>|Promise<T>|EventEmitter<T>): any {
    if (ɵisPromise(obj)) {
      return _promiseStrategy;
    }

    if (ɵisObservable(obj)) {
      return _observableStrategy;
    }

    throw invalidPipeArgumentError(AsyncPipe, obj);
  }

  private _dispose(): void {
    this._strategy.dispose(this._subscription!);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }

  private _updateLatestValue(async: any, value: T): void {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
