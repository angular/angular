var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isBlank, isPresent, isPromise } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { Pipe, Injectable, ChangeDetectorRef, WrappedValue } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
class ObservableStrategy {
    createSubscription(async, updateLatestValue) {
        return ObservableWrapper.subscribe(async, updateLatestValue, e => { throw e; });
    }
    dispose(subscription) { ObservableWrapper.dispose(subscription); }
    onDestroy(subscription) { ObservableWrapper.dispose(subscription); }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue);
    }
    dispose(subscription) { }
    onDestroy(subscription) { }
}
var _promiseStrategy = new PromiseStrategy();
var _observableStrategy = new ObservableStrategy();
var __unused; // avoid unused import when Promise union types are erased
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
let AsyncPipe_1;
export let AsyncPipe = AsyncPipe_1 = class AsyncPipe {
    constructor(_ref) {
        /** @internal */
        this._latestValue = null;
        /** @internal */
        this._latestReturnedValue = null;
        /** @internal */
        this._subscription = null;
        /** @internal */
        this._obj = null;
        this._strategy = null;
        this._ref = _ref;
    }
    ngOnDestroy() {
        if (isPresent(this._subscription)) {
            this._dispose();
        }
    }
    transform(obj) {
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
        }
        else {
            this._latestReturnedValue = this._latestValue;
            return WrappedValue.wrap(this._latestValue);
        }
    }
    /** @internal */
    _subscribe(obj) {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
    }
    /** @internal */
    _selectStrategy(obj) {
        if (isPromise(obj)) {
            return _promiseStrategy;
        }
        else if (ObservableWrapper.isObservable(obj)) {
            return _observableStrategy;
        }
        else {
            throw new InvalidPipeArgumentException(AsyncPipe_1, obj);
        }
    }
    /** @internal */
    _dispose() {
        this._strategy.dispose(this._subscription);
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
    }
    /** @internal */
    _updateLatestValue(async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
        }
    }
};
AsyncPipe = AsyncPipe_1 = __decorate([
    // avoid unused import when Promise union types are erased
    Pipe({ name: 'async', pure: false }),
    Injectable(), 
    __metadata('design:paramtypes', [ChangeDetectorRef])
], AsyncPipe);
