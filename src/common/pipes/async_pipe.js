'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
var ObservableStrategy = (function () {
    function ObservableStrategy() {
    }
    ObservableStrategy.prototype.createSubscription = function (async, updateLatestValue) {
        return async_1.ObservableWrapper.subscribe(async, updateLatestValue, function (e) { throw e; });
    };
    ObservableStrategy.prototype.dispose = function (subscription) { async_1.ObservableWrapper.dispose(subscription); };
    ObservableStrategy.prototype.onDestroy = function (subscription) { async_1.ObservableWrapper.dispose(subscription); };
    return ObservableStrategy;
})();
var PromiseStrategy = (function () {
    function PromiseStrategy() {
    }
    PromiseStrategy.prototype.createSubscription = function (async, updateLatestValue) {
        return async.then(updateLatestValue);
    };
    PromiseStrategy.prototype.dispose = function (subscription) { };
    PromiseStrategy.prototype.onDestroy = function (subscription) { };
    return PromiseStrategy;
})();
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
var AsyncPipe = (function () {
    function AsyncPipe(_ref) {
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
    AsyncPipe.prototype.ngOnDestroy = function () {
        if (lang_1.isPresent(this._subscription)) {
            this._dispose();
        }
    };
    AsyncPipe.prototype.transform = function (obj, args) {
        if (lang_1.isBlank(this._obj)) {
            if (lang_1.isPresent(obj)) {
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
            return core_1.WrappedValue.wrap(this._latestValue);
        }
    };
    /** @internal */
    AsyncPipe.prototype._subscribe = function (obj) {
        var _this = this;
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription =
            this._strategy.createSubscription(obj, function (value) { return _this._updateLatestValue(obj, value); });
    };
    /** @internal */
    AsyncPipe.prototype._selectStrategy = function (obj) {
        if (lang_1.isPromise(obj)) {
            return _promiseStrategy;
        }
        else if (async_1.ObservableWrapper.isObservable(obj)) {
            return _observableStrategy;
        }
        else {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(AsyncPipe, obj);
        }
    };
    /** @internal */
    AsyncPipe.prototype._dispose = function () {
        this._strategy.dispose(this._subscription);
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
    };
    /** @internal */
    AsyncPipe.prototype._updateLatestValue = function (async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
        }
    };
    AsyncPipe = __decorate([
        core_1.Pipe({ name: 'async', pure: false }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.ChangeDetectorRef])
    ], AsyncPipe);
    return AsyncPipe;
})();
exports.AsyncPipe = AsyncPipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6WyJPYnNlcnZhYmxlU3RyYXRlZ3kiLCJPYnNlcnZhYmxlU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJPYnNlcnZhYmxlU3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uIiwiT2JzZXJ2YWJsZVN0cmF0ZWd5LmRpc3Bvc2UiLCJPYnNlcnZhYmxlU3RyYXRlZ3kub25EZXN0cm95IiwiUHJvbWlzZVN0cmF0ZWd5IiwiUHJvbWlzZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvbWlzZVN0cmF0ZWd5LmNyZWF0ZVN1YnNjcmlwdGlvbiIsIlByb21pc2VTdHJhdGVneS5kaXNwb3NlIiwiUHJvbWlzZVN0cmF0ZWd5Lm9uRGVzdHJveSIsIkFzeW5jUGlwZSIsIkFzeW5jUGlwZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZS5uZ09uRGVzdHJveSIsIkFzeW5jUGlwZS50cmFuc2Zvcm0iLCJBc3luY1BpcGUuX3N1YnNjcmliZSIsIkFzeW5jUGlwZS5fc2VsZWN0U3RyYXRlZ3kiLCJBc3luY1BpcGUuX2Rpc3Bvc2UiLCJBc3luY1BpcGUuX3VwZGF0ZUxhdGVzdFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFCQUFtRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlFLHNCQUFtRSwyQkFBMkIsQ0FBQyxDQUFBO0FBQy9GLHFCQU9PLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRS9FO0lBQUFBO0lBUUFDLENBQUNBO0lBUENELCtDQUFrQkEsR0FBbEJBLFVBQW1CQSxLQUFVQSxFQUFFQSxpQkFBc0JBO1FBQ25ERSxNQUFNQSxDQUFDQSx5QkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLGlCQUFpQkEsRUFBRUEsVUFBQUEsQ0FBQ0EsSUFBTUEsTUFBTUEs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QUNBO0lBRURMLGdCQUFnQkE7SUFDaEJBLDRCQUFRQSxHQUFSQTtRQUNFTSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMzQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakNBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBO1FBQzFCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFRE4sZ0JBQWdCQTtJQUNoQkEsc0NBQWtCQSxHQUFsQkEsVUFBbUJBLEtBQVVBLEVBQUVBLEtBQWFBO1FBQzFDTyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQTlFSFA7UUFBQ0EsV0FBSUEsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsRUFBQ0EsQ0FBQ0E7UUFDbENBLGlCQUFVQSxFQUFFQTs7a0JBOEVaQTtJQUFEQSxnQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvRUQsSUErRUM7QUE3RVksaUJBQVMsWUE2RXJCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgaXNQcm9taXNlLCBDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZSwgT2JzZXJ2YWJsZVdyYXBwZXIsIE9ic2VydmFibGUsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBQaXBlLFxuICBJbmplY3RhYmxlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgT25EZXN0cm95LFxuICBQaXBlVHJhbnNmb3JtLFxuICBXcmFwcGVkVmFsdWVcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuY2xhc3MgT2JzZXJ2YWJsZVN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBhbnksIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoYXN5bmMsIHVwZGF0ZUxhdGVzdFZhbHVlLCBlID0+IHsgdGhyb3cgZTsgfSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogYW55KTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2Uoc3Vic2NyaXB0aW9uKTsgfVxuXG4gIG9uRGVzdHJveShzdWJzY3JpcHRpb246IGFueSk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHN1YnNjcmlwdGlvbik7IH1cbn1cblxuY2xhc3MgUHJvbWlzZVN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBhbnksIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBhc3luYy50aGVuKHVwZGF0ZUxhdGVzdFZhbHVlKTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBhbnkpOiB2b2lkIHt9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogYW55KTogdm9pZCB7fVxufVxuXG52YXIgX3Byb21pc2VTdHJhdGVneSA9IG5ldyBQcm9taXNlU3RyYXRlZ3koKTtcbnZhciBfb2JzZXJ2YWJsZVN0cmF0ZWd5ID0gbmV3IE9ic2VydmFibGVTdHJhdGVneSgpO1xuXG5cbi8qKlxuICogVGhlIGBhc3luY2AgcGlwZSBzdWJzY3JpYmVzIHRvIGFuIE9ic2VydmFibGUgb3IgUHJvbWlzZSBhbmQgcmV0dXJucyB0aGUgbGF0ZXN0IHZhbHVlIGl0IGhhc1xuICogZW1pdHRlZC5cbiAqIFdoZW4gYSBuZXcgdmFsdWUgaXMgZW1pdHRlZCwgdGhlIGBhc3luY2AgcGlwZSBtYXJrcyB0aGUgY29tcG9uZW50IHRvIGJlIGNoZWNrZWQgZm9yIGNoYW5nZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGlzIGV4YW1wbGUgYmluZHMgYSBgUHJvbWlzZWAgdG8gdGhlIHZpZXcuIENsaWNraW5nIHRoZSBgUmVzb2x2ZWAgYnV0dG9uIHJlc29sdmVzIHRoZVxuICogcHJvbWlzZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0FzeW5jUGlwZSd9XG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBgYXN5bmNgIHdpdGggT2JzZXJ2YWJsZXMuIFRoZSBleGFtcGxlIGJlbG93IGJpbmRzIHRoZSBgdGltZWAgT2JzZXJ2YWJsZVxuICogdG8gdGhlIHZpZXcuIEV2ZXJ5IDUwMG1zLCB0aGUgYHRpbWVgIE9ic2VydmFibGUgdXBkYXRlcyB0aGUgdmlldyB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYGBgXG4gKi9cbkBQaXBlKHtuYW1lOiAnYXN5bmMnLCBwdXJlOiBmYWxzZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSwgT25EZXN0cm95IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbGF0ZXN0VmFsdWU6IE9iamVjdCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xhdGVzdFJldHVybmVkVmFsdWU6IE9iamVjdCA9IG51bGw7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3Vic2NyaXB0aW9uOiBPYmplY3QgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9vYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55PiA9IG51bGw7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBhbnkgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgY29uc3RydWN0b3IoX3JlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHsgdGhpcy5fcmVmID0gX3JlZjsgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fc3Vic2NyaXB0aW9uKSkge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHRyYW5zZm9ybShvYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55PiwgYXJncz86IGFueVtdKTogYW55IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vYmopKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KG9iaikpIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAob2JqICE9PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShvYmopO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9sYXRlc3RWYWx1ZSA9PT0gdGhpcy5fbGF0ZXN0UmV0dXJuZWRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICAgIHJldHVybiBXcmFwcGVkVmFsdWUud3JhcCh0aGlzLl9sYXRlc3RWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3Vic2NyaWJlKG9iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPVxuICAgICAgICB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24ob2JqLCB2YWx1ZSA9PiB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZWxlY3RTdHJhdGVneShvYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55Pik6IGFueSB7XG4gICAgaWYgKGlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKE9ic2VydmFibGVXcmFwcGVyLmlzT2JzZXJ2YWJsZShvYmopKSB7XG4gICAgICByZXR1cm4gX29ic2VydmFibGVTdHJhdGVneTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oQXN5bmNQaXBlLCBvYmopO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24pO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KSB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=