var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
export let AsyncPipe = class {
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
    onDestroy() {
        if (isPresent(this._subscription)) {
            this._dispose();
        }
    }
    transform(obj, args) {
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
        this._subscription =
            this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value));
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
            throw new InvalidPipeArgumentException(AsyncPipe, obj);
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
AsyncPipe = __decorate([
    Pipe({ name: 'async', pure: false }),
    Injectable(), 
    __metadata('design:paramtypes', [ChangeDetectorRef])
], AsyncPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6WyJPYnNlcnZhYmxlU3RyYXRlZ3kiLCJPYnNlcnZhYmxlU3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uIiwiT2JzZXJ2YWJsZVN0cmF0ZWd5LmRpc3Bvc2UiLCJPYnNlcnZhYmxlU3RyYXRlZ3kub25EZXN0cm95IiwiUHJvbWlzZVN0cmF0ZWd5IiwiUHJvbWlzZVN0cmF0ZWd5LmNyZWF0ZVN1YnNjcmlwdGlvbiIsIlByb21pc2VTdHJhdGVneS5kaXNwb3NlIiwiUHJvbWlzZVN0cmF0ZWd5Lm9uRGVzdHJveSIsIkFzeW5jUGlwZSIsIkFzeW5jUGlwZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZS5vbkRlc3Ryb3kiLCJBc3luY1BpcGUudHJhbnNmb3JtIiwiQXN5bmNQaXBlLl9zdWJzY3JpYmUiLCJBc3luY1BpcGUuX3NlbGVjdFN0cmF0ZWd5IiwiQXN5bmNQaXBlLl9kaXNwb3NlIiwiQXN5bmNQaXBlLl91cGRhdGVMYXRlc3RWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFRLE1BQU0sMEJBQTBCO09BQ3RFLEVBQVUsaUJBQWlCLEVBQTJCLE1BQU0sMkJBQTJCO09BQ3ZGLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixpQkFBaUIsRUFHakIsWUFBWSxFQUNiLE1BQU0sZUFBZTtPQUVmLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUM7QUFFOUU7SUFDRUEsa0JBQWtCQSxDQUFDQSxLQUFVQSxFQUFFQSxpQkFBc0JBO1FBQ25EQyxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLGlCQUFpQkEsRUFBRUEsQ0FBQ0EsTUFBTUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FB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QUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBO1FBQzFCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFRE4sZ0JBQWdCQTtJQUNoQkEsa0JBQWtCQSxDQUFDQSxLQUFVQSxFQUFFQSxLQUFhQTtRQUMxQ08sRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSFAsQ0FBQ0E7QUEvRUQ7SUFBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztJQUNsQyxVQUFVLEVBQUU7O2NBOEVaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgaXNQcm9taXNlLCBDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZSwgT2JzZXJ2YWJsZVdyYXBwZXIsIE9ic2VydmFibGUsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBQaXBlLFxuICBJbmplY3RhYmxlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgUGlwZU9uRGVzdHJveSxcbiAgUGlwZVRyYW5zZm9ybSxcbiAgV3JhcHBlZFZhbHVlXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbmNsYXNzIE9ic2VydmFibGVTdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogYW55LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKGFzeW5jLCB1cGRhdGVMYXRlc3RWYWx1ZSwgZSA9PiB7IHRocm93IGU7IH0pO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IGFueSk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHN1YnNjcmlwdGlvbik7IH1cblxuICBvbkRlc3Ryb3koc3Vic2NyaXB0aW9uOiBhbnkpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZShzdWJzY3JpcHRpb24pOyB9XG59XG5cbmNsYXNzIFByb21pc2VTdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogYW55LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogYW55IHtcbiAgICByZXR1cm4gYXN5bmMudGhlbih1cGRhdGVMYXRlc3RWYWx1ZSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogYW55KTogdm9pZCB7fVxuXG4gIG9uRGVzdHJveShzdWJzY3JpcHRpb246IGFueSk6IHZvaWQge31cbn1cblxudmFyIF9wcm9taXNlU3RyYXRlZ3kgPSBuZXcgUHJvbWlzZVN0cmF0ZWd5KCk7XG52YXIgX29ic2VydmFibGVTdHJhdGVneSA9IG5ldyBPYnNlcnZhYmxlU3RyYXRlZ3koKTtcblxuXG4vKipcbiAqIFRoZSBgYXN5bmNgIHBpcGUgc3Vic2NyaWJlcyB0byBhbiBPYnNlcnZhYmxlIG9yIFByb21pc2UgYW5kIHJldHVybnMgdGhlIGxhdGVzdCB2YWx1ZSBpdCBoYXNcbiAqIGVtaXR0ZWQuXG4gKiBXaGVuIGEgbmV3IHZhbHVlIGlzIGVtaXR0ZWQsIHRoZSBgYXN5bmNgIHBpcGUgbWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGVja2VkIGZvciBjaGFuZ2VzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhpcyBleGFtcGxlIGJpbmRzIGEgYFByb21pc2VgIHRvIHRoZSB2aWV3LiBDbGlja2luZyB0aGUgYFJlc29sdmVgIGJ1dHRvbiByZXNvbHZlcyB0aGVcbiAqIHByb21pc2UuXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvYXN5bmNfcGlwZS9hc3luY19waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdBc3luY1BpcGUnfVxuICpcbiAqIEl0J3MgYWxzbyBwb3NzaWJsZSB0byB1c2UgYGFzeW5jYCB3aXRoIE9ic2VydmFibGVzLiBUaGUgZXhhbXBsZSBiZWxvdyBiaW5kcyB0aGUgYHRpbWVgIE9ic2VydmFibGVcbiAqIHRvIHRoZSB2aWV3LiBFdmVyeSA1MDBtcywgdGhlIGB0aW1lYCBPYnNlcnZhYmxlIHVwZGF0ZXMgdGhlIHZpZXcgd2l0aCB0aGUgY3VycmVudCB0aW1lLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGBgYFxuICovXG5AUGlwZSh7bmFtZTogJ2FzeW5jJywgcHVyZTogZmFsc2V9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0sIFBpcGVPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9sYXRlc3RWYWx1ZTogT2JqZWN0ID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbGF0ZXN0UmV0dXJuZWRWYWx1ZTogT2JqZWN0ID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9zdWJzY3JpcHRpb246IE9iamVjdCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+ID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IGFueSA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9yZWY6IENoYW5nZURldGVjdG9yUmVmO1xuICBjb25zdHJ1Y3RvcihfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikgeyB0aGlzLl9yZWYgPSBfcmVmOyB9XG5cbiAgb25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fc3Vic2NyaXB0aW9uKSkge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHRyYW5zZm9ybShvYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55PiwgYXJncz86IGFueVtdKTogYW55IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vYmopKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KG9iaikpIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAob2JqICE9PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShvYmopO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9sYXRlc3RWYWx1ZSA9PT0gdGhpcy5fbGF0ZXN0UmV0dXJuZWRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICAgIHJldHVybiBXcmFwcGVkVmFsdWUud3JhcCh0aGlzLl9sYXRlc3RWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3Vic2NyaWJlKG9iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPVxuICAgICAgICB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24ob2JqLCB2YWx1ZSA9PiB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZWxlY3RTdHJhdGVneShvYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55Pik6IGFueSB7XG4gICAgaWYgKGlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKE9ic2VydmFibGVXcmFwcGVyLmlzT2JzZXJ2YWJsZShvYmopKSB7XG4gICAgICByZXR1cm4gX29ic2VydmFibGVTdHJhdGVneTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oQXN5bmNQaXBlLCBvYmopO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24pO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KSB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=