/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, EventEmitter, OnDestroy, Pipe, PipeTransform, ɵisPromise, ɵisSubscribable} from '@angular/core';
import {Subscribable, Unsubscribable} from 'rxjs';

import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

interface SubscriptionStrategy<T> {
  createSubscription(async: Subscribable<T>|Promise<T>, updateLatestValue: (value: T) => void):
      Unsubscribable|Promise<void>;
  dispose(subscription: Unsubscribable|Promise<void>): void;
  onDestroy(subscription: Unsubscribable|Promise<void>): void;
}

class SubscribableStrategy<T> implements SubscriptionStrategy<T> {
  createSubscription(async: Subscribable<T>, updateLatestValue: (value: T) => void):
      Unsubscribable {
    return async.subscribe({
      next: updateLatestValue,
      error: (e: any) => {
        throw e;
      }
    });
  }

  dispose(subscription: Unsubscribable): void {
    subscription.unsubscribe();
  }

  onDestroy(subscription: Unsubscribable): void {
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
const _subscribableStrategy = new SubscribableStrategy();

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

  private _subscription: Unsubscribable|Promise<void>|null = null;
  private _obj: Subscribable<T>|Promise<T>|EventEmitter<T>|null = null;
  private _strategy: SubscriptionStrategy<T> = null!;

  constructor(private _ref: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }
  }

  transform(obj: Subscribable<T>|Promise<T>): T|null;
  transform(obj: null|undefined): null;
  transform(obj: Subscribable<T>|Promise<T>|null|undefined): T|null;
  transform(obj: Subscribable<T>|Promise<T>|null|undefined): T|null {
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

  private _subscribe(obj: Subscribable<T>|Promise<T>|EventEmitter<T>): void {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription =
        this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
  }

  private _selectStrategy(obj: Subscribable<T>|Promise<T>|EventEmitter<T>): any {
    if (ɵisPromise(obj)) {
      return _promiseStrategy;
    }

    if (ɵisSubscribable(obj)) {
      return _subscribableStrategy;
    }

    throw invalidPipeArgumentError(AsyncPipe, obj);
  }

  private _dispose(): void {
    this._strategy.dispose(this._subscription!);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }

  private _updateLatestValue(async: Subscribable<T>|Promise<T>|EventEmitter<T>, value: T): void {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
