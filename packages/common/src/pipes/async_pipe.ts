/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  EventEmitter,
  OnDestroy,
  Pipe,
  PipeTransform,
  untracked,
  ɵisPromise,
  ɵisSubscribable,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER as INTERNAL_APPLICATION_ERROR_HANDLER,
  inject,
} from '@angular/core';
import type {Observable, Subscribable, Unsubscribable} from 'rxjs';

import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

interface SubscriptionStrategy {
  createSubscription(
    async: Subscribable<any> | PromiseLike<any>,
    updateLatestValue: any,
    onError: (e: unknown) => void,
  ): Unsubscribable | PromiseLike<any>;
  dispose(subscription: Unsubscribable | PromiseLike<any>): void;
}

class SubscribableStrategy implements SubscriptionStrategy {
  createSubscription(
    async: Subscribable<any>,
    updateLatestValue: any,
    onError: (e: unknown) => void,
  ): Unsubscribable {
    // Subscription can be side-effectful, and we don't want any signal reads which happen in the
    // side effect of the subscription to be tracked by a component's template when that
    // subscription is triggered via the async pipe. So we wrap the subscription in `untracked` to
    // decouple from the current reactive context.
    //
    // `untracked` also prevents signal _writes_ which happen in the subscription side effect from
    // being treated as signal writes during the template evaluation (which throws errors).
    return untracked(() =>
      async.subscribe({
        next: updateLatestValue,
        error: onError,
      }),
    );
  }

  dispose(subscription: Unsubscribable): void {
    // See the comment in `createSubscription` above on the use of `untracked`.
    untracked(() => subscription.unsubscribe());
  }
}

class PromiseStrategy implements SubscriptionStrategy {
  createSubscription(
    async: PromiseLike<any>,
    updateLatestValue: ((v: any) => any) | null,
    onError: ((e: unknown) => void) | null,
  ): Unsubscribable {
    // According to the promise specification, promises are not cancellable by default.
    // Once a promise is created, it will either resolve or reject, and it doesn't
    // provide a built-in mechanism to cancel it.
    // There may be situations where a promise is provided, and it either resolves after
    // the pipe has been destroyed or never resolves at all. If the promise never
    // resolves — potentially due to factors beyond our control, such as third-party
    // libraries — this can lead to a memory leak.
    // When we use `async.then(updateLatestValue)`, the engine captures a reference to the
    // `updateLatestValue` function. This allows the promise to invoke that function when it
    // resolves. In this case, the promise directly captures a reference to the
    // `updateLatestValue` function. If the promise resolves later, it retains a reference
    // to the original `updateLatestValue`, meaning that even if the context where
    // `updateLatestValue` was defined has been destroyed, the function reference remains in memory.
    // This can lead to memory leaks if `updateLatestValue` is no longer needed or if it holds
    // onto resources that should be released.
    // When we do `async.then(v => ...)` the promise captures a reference to the lambda
    // function (the arrow function).
    // When we assign `updateLatestValue = null` within the context of an `unsubscribe` function,
    // we're changing the reference of `updateLatestValue` in the current scope to `null`.
    // The lambda will no longer have access to it after the assignment, effectively
    // preventing any further calls to the original function and allowing it to be garbage collected.
    async.then(
      // Using optional chaining because we may have set it to `null`; since the promise
      // is async, the view might be destroyed by the time the promise resolves.
      (v) => updateLatestValue?.(v),
      (e) => onError?.(e),
    );
    return {
      unsubscribe: () => {
        updateLatestValue = null;
        onError = null;
      },
    };
  }

  dispose(subscription: Unsubscribable): void {
    subscription.unsubscribe();
  }
}

const _promiseStrategy = /* @__PURE__ */ new PromiseStrategy();
const _subscribableStrategy = /* @__PURE__ */ new SubscribableStrategy();

/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks. When the reference of the expression changes, the `async` pipe
 * automatically unsubscribes from the old `Observable` or `Promise` and subscribes to the new one.
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
@Pipe({
  name: 'async',
  pure: false,
})
export class AsyncPipe implements OnDestroy, PipeTransform {
  private _ref: ChangeDetectorRef | null;
  private _latestValue: any = null;
  private markForCheckOnValueUpdate = true;

  private _subscription: Unsubscribable | PromiseLike<any> | null = null;
  private _obj: Subscribable<any> | PromiseLike<any> | EventEmitter<any> | null = null;
  private _strategy: SubscriptionStrategy | null = null;
  private readonly applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);

  constructor(ref: ChangeDetectorRef) {
    // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
    // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
    this._ref = ref;
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }
    // Clear the `ChangeDetectorRef` and its association with the view data, to mitigate
    // potential memory leaks in Observables that could otherwise cause the view data to
    // be retained.
    // https://github.com/angular/angular/issues/17624
    this._ref = null;
  }

  // NOTE(@benlesh): Because Observable has deprecated a few call patterns for `subscribe`,
  // TypeScript has a hard time matching Observable to Subscribable, for more information
  // see https://github.com/microsoft/TypeScript/issues/43643

  transform<T>(obj: Observable<T> | Subscribable<T> | PromiseLike<T>): T | null;
  transform<T>(obj: null | undefined): null;
  transform<T>(obj: Observable<T> | Subscribable<T> | PromiseLike<T> | null | undefined): T | null;
  transform<T>(obj: Observable<T> | Subscribable<T> | PromiseLike<T> | null | undefined): T | null {
    if (!this._obj) {
      if (obj) {
        try {
          // Only call `markForCheck` if the value is updated asynchronously.
          // Synchronous updates _during_ subscription should not wastefully mark for check -
          // this value is already going to be returned from the transform function.
          this.markForCheckOnValueUpdate = false;
          this._subscribe(obj);
        } finally {
          this.markForCheckOnValueUpdate = true;
        }
      }
      return this._latestValue;
    }

    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }

    return this._latestValue;
  }

  private _subscribe(obj: Subscribable<any> | PromiseLike<any> | EventEmitter<any>): void {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(
      obj,
      (value: Object) => this._updateLatestValue(obj, value),
      (e) => this.applicationErrorHandler(e),
    );
  }

  private _selectStrategy(
    obj: Subscribable<any> | PromiseLike<any> | EventEmitter<any>,
  ): SubscriptionStrategy {
    if (ɵisPromise(obj)) {
      return _promiseStrategy;
    }

    if (ɵisSubscribable(obj)) {
      return _subscribableStrategy;
    }

    throw invalidPipeArgumentError(AsyncPipe, obj);
  }

  private _dispose(): void {
    // Note: `dispose` is only called if a subscription has been initialized before, indicating
    // that `this._strategy` is also available.
    this._strategy!.dispose(this._subscription!);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }

  private _updateLatestValue(async: any, value: Object): void {
    if (async === this._obj) {
      this._latestValue = value;
      if (this.markForCheckOnValueUpdate) {
        this._ref?.markForCheck();
      }
    }
  }
}
