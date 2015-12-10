'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6WyJPYnNlcnZhYmxlU3RyYXRlZ3kiLCJPYnNlcnZhYmxlU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJPYnNlcnZhYmxlU3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uIiwiT2JzZXJ2YWJsZVN0cmF0ZWd5LmRpc3Bvc2UiLCJPYnNlcnZhYmxlU3RyYXRlZ3kub25EZXN0cm95IiwiUHJvbWlzZVN0cmF0ZWd5IiwiUHJvbWlzZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvbWlzZVN0cmF0ZWd5LmNyZWF0ZVN1YnNjcmlwdGlvbiIsIlByb21pc2VTdHJhdGVneS5kaXNwb3NlIiwiUHJvbWlzZVN0cmF0ZWd5Lm9uRGVzdHJveSIsIkFzeW5jUGlwZSIsIkFzeW5jUGlwZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZS5uZ09uRGVzdHJveSIsIkFzeW5jUGlwZS50cmFuc2Zvcm0iLCJBc3luY1BpcGUuX3N1YnNjcmliZSIsIkFzeW5jUGlwZS5fc2VsZWN0U3RyYXRlZ3kiLCJBc3luY1BpcGUuX2Rpc3Bvc2UiLCJBc3luY1BpcGUuX3VwZGF0ZUxhdGVzdFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBbUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RSxzQkFBbUUsMkJBQTJCLENBQUMsQ0FBQTtBQUMvRixxQkFPTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRTtJQUFBQTtJQVFBQyxDQUFDQTtJQVBDRCwrQ0FBa0JBLEdBQWxCQSxVQUFtQkEsS0FBVUEsRUFBRUEsaUJBQXNCQTtRQUNuREUsTUFBTUEsQ0FBQ0EseUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxpQkFBaUJBLEVBQUVBLFVBQUFBLENBQUNBLElBQU1BLE1BQU1BLENB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Q0E7SUFDSEEsQ0FBQ0E7SUFFREwsZ0JBQWdCQTtJQUNoQkEsNEJBQVFBLEdBQVJBO1FBQ0VNLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQzNDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDMUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25CQSxDQUFDQTtJQUVETixnQkFBZ0JBO0lBQ2hCQSxzQ0FBa0JBLEdBQWxCQSxVQUFtQkEsS0FBVUEsRUFBRUEsS0FBYUE7UUFDMUNPLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFDM0JBLENBQUNBO0lBQ0hBLENBQUNBO0lBOUVIUDtRQUFDQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQTtRQUNsQ0EsaUJBQVVBLEVBQUVBOztrQkE4RVpBO0lBQURBLGdCQUFDQTtBQUFEQSxDQUFDQSxBQS9FRCxJQStFQztBQTdFWSxpQkFBUyxZQTZFckIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBpc1Byb21pc2UsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlLCBPYnNlcnZhYmxlV3JhcHBlciwgT2JzZXJ2YWJsZSwgRXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIFBpcGUsXG4gIEluamVjdGFibGUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkRlc3Ryb3ksXG4gIFBpcGVUcmFuc2Zvcm0sXG4gIFdyYXBwZWRWYWx1ZVxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG5jbGFzcyBPYnNlcnZhYmxlU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IGFueSwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShhc3luYywgdXBkYXRlTGF0ZXN0VmFsdWUsIGUgPT4geyB0aHJvdyBlOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBhbnkpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZShzdWJzY3JpcHRpb24pOyB9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogYW55KTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2Uoc3Vic2NyaXB0aW9uKTsgfVxufVxuXG5jbGFzcyBQcm9taXNlU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IGFueSwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIGFzeW5jLnRoZW4odXBkYXRlTGF0ZXN0VmFsdWUpO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IGFueSk6IHZvaWQge31cblxuICBvbkRlc3Ryb3koc3Vic2NyaXB0aW9uOiBhbnkpOiB2b2lkIHt9XG59XG5cbnZhciBfcHJvbWlzZVN0cmF0ZWd5ID0gbmV3IFByb21pc2VTdHJhdGVneSgpO1xudmFyIF9vYnNlcnZhYmxlU3RyYXRlZ3kgPSBuZXcgT2JzZXJ2YWJsZVN0cmF0ZWd5KCk7XG5cblxuLyoqXG4gKiBUaGUgYGFzeW5jYCBwaXBlIHN1YnNjcmliZXMgdG8gYW4gT2JzZXJ2YWJsZSBvciBQcm9taXNlIGFuZCByZXR1cm5zIHRoZSBsYXRlc3QgdmFsdWUgaXQgaGFzXG4gKiBlbWl0dGVkLlxuICogV2hlbiBhIG5ldyB2YWx1ZSBpcyBlbWl0dGVkLCB0aGUgYGFzeW5jYCBwaXBlIG1hcmtzIHRoZSBjb21wb25lbnQgdG8gYmUgY2hlY2tlZCBmb3IgY2hhbmdlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoaXMgZXhhbXBsZSBiaW5kcyBhIGBQcm9taXNlYCB0byB0aGUgdmlldy4gQ2xpY2tpbmcgdGhlIGBSZXNvbHZlYCBidXR0b24gcmVzb2x2ZXMgdGhlXG4gKiBwcm9taXNlLlxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL2FzeW5jX3BpcGUvYXN5bmNfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlJ31cbiAqXG4gKiBJdCdzIGFsc28gcG9zc2libGUgdG8gdXNlIGBhc3luY2Agd2l0aCBPYnNlcnZhYmxlcy4gVGhlIGV4YW1wbGUgYmVsb3cgYmluZHMgdGhlIGB0aW1lYCBPYnNlcnZhYmxlXG4gKiB0byB0aGUgdmlldy4gRXZlcnkgNTAwbXMsIHRoZSBgdGltZWAgT2JzZXJ2YWJsZSB1cGRhdGVzIHRoZSB2aWV3IHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBgYGBcbiAqL1xuQFBpcGUoe25hbWU6ICdhc3luYycsIHB1cmU6IGZhbHNlfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtLCBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9sYXRlc3RWYWx1ZTogT2JqZWN0ID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbGF0ZXN0UmV0dXJuZWRWYWx1ZTogT2JqZWN0ID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9zdWJzY3JpcHRpb246IE9iamVjdCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+ID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IGFueSA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9yZWY6IENoYW5nZURldGVjdG9yUmVmO1xuICBjb25zdHJ1Y3RvcihfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikgeyB0aGlzLl9yZWYgPSBfcmVmOyB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9zdWJzY3JpcHRpb24pKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgdHJhbnNmb3JtKG9iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+LCBhcmdzPzogYW55W10pOiBhbnkge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX29iaikpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQob2JqKSkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpYmUob2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqICE9PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShvYmopO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9sYXRlc3RWYWx1ZSA9PT0gdGhpcy5fbGF0ZXN0UmV0dXJuZWRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICAgIHJldHVybiBXcmFwcGVkVmFsdWUud3JhcCh0aGlzLl9sYXRlc3RWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3Vic2NyaWJlKG9iajogT2JzZXJ2YWJsZTxhbnk+fCBQcm9taXNlPGFueT58IEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPVxuICAgICAgICB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24ob2JqLCB2YWx1ZSA9PiB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZWxlY3RTdHJhdGVneShvYmo6IE9ic2VydmFibGU8YW55PnwgUHJvbWlzZTxhbnk+fCBFdmVudEVtaXR0ZXI8YW55Pik6IGFueSB7XG4gICAgaWYgKGlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKE9ic2VydmFibGVXcmFwcGVyLmlzT2JzZXJ2YWJsZShvYmopKSB7XG4gICAgICByZXR1cm4gX29ic2VydmFibGVTdHJhdGVneTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oQXN5bmNQaXBlLCBvYmopO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24pO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KSB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=