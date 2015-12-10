'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
exports.PromiseWrapper = promise_1.PromiseWrapper;
exports.Promise = promise_1.Promise;
var Subject_1 = require('rxjs/Subject');
var Observable_1 = require('rxjs/Observable');
var fromPromise_1 = require('rxjs/observable/fromPromise');
var toPromise_1 = require('rxjs/operator/toPromise');
var Subject_2 = require('rxjs/Subject');
exports.Subject = Subject_2.Subject;
var TimerWrapper = (function () {
    function TimerWrapper() {
    }
    TimerWrapper.setTimeout = function (fn, millis) {
        return lang_1.global.setTimeout(fn, millis);
    };
    TimerWrapper.clearTimeout = function (id) { lang_1.global.clearTimeout(id); };
    TimerWrapper.setInterval = function (fn, millis) {
        return lang_1.global.setInterval(fn, millis);
    };
    TimerWrapper.clearInterval = function (id) { lang_1.global.clearInterval(id); };
    return TimerWrapper;
})();
exports.TimerWrapper = TimerWrapper;
var ObservableWrapper = (function () {
    function ObservableWrapper() {
    }
    // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
    ObservableWrapper.subscribe = function (emitter, onNext, onError, onComplete) {
        if (onComplete === void 0) { onComplete = function () { }; }
        onError = (typeof onError === "function") && onError || lang_1.noop;
        onComplete = (typeof onComplete === "function") && onComplete || lang_1.noop;
        return emitter.subscribe({ next: onNext, error: onError, complete: onComplete });
    };
    ObservableWrapper.isObservable = function (obs) { return obs instanceof Observable_1.Observable; };
    /**
     * Returns whether `obs` has any subscribers listening to events.
     */
    ObservableWrapper.hasSubscribers = function (obs) { return obs.observers.length > 0; };
    ObservableWrapper.dispose = function (subscription) { subscription.unsubscribe(); };
    /**
     * @deprecated - use callEmit() instead
     */
    ObservableWrapper.callNext = function (emitter, value) { emitter.next(value); };
    ObservableWrapper.callEmit = function (emitter, value) { emitter.emit(value); };
    ObservableWrapper.callError = function (emitter, error) { emitter.error(error); };
    ObservableWrapper.callComplete = function (emitter) { emitter.complete(); };
    ObservableWrapper.fromPromise = function (promise) {
        return fromPromise_1.PromiseObservable.create(promise);
    };
    ObservableWrapper.toPromise = function (obj) { return toPromise_1.toPromise.call(obj); };
    return ObservableWrapper;
})();
exports.ObservableWrapper = ObservableWrapper;
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
var EventEmitter = (function (_super) {
    __extends(EventEmitter, _super);
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    function EventEmitter(isAsync) {
        if (isAsync === void 0) { isAsync = true; }
        _super.call(this);
        this._isAsync = isAsync;
    }
    EventEmitter.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
    /**
     * @deprecated - use .emit(value) instead
     */
    EventEmitter.prototype.next = function (value) { _super.prototype.next.call(this, value); };
    EventEmitter.prototype.subscribe = function (generatorOrNext, error, complete) {
        var schedulerFn;
        var errorFn = function (err) { return null; };
        var completeFn = function () { return null; };
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext.next(value); }); } :
                function (value) { generatorOrNext.next(value); };
            if (generatorOrNext.error) {
                errorFn = this._isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                    function (err) { generatorOrNext.error(err); };
            }
            if (generatorOrNext.complete) {
                completeFn = this._isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                    function () { generatorOrNext.complete(); };
            }
        }
        else {
            schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                function (value) { generatorOrNext(value); };
            if (error) {
                errorFn =
                    this._isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
            }
            if (complete) {
                completeFn =
                    this._isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
            }
        }
        return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
    };
    return EventEmitter;
})(Subject_1.Subject);
exports.EventEmitter = EventEmitter;
/**
 * Allows publishing and subscribing to series of async values.
 *
 * The `Observable` class is an alias to the `Observable` returned from
 * {@link https://github.com/reactivex/rxjs}. `Observables` are a means of delivering
 * any number of values over any period of time. `Observables` can be thought of as a
 * mixture of `Promise` and `Array`. `Observables` are like `Arrays` in that they can have
 * chained combinators -- like `map`, `reduce`, and `filter` -- attached in order to
 * perform projections and transformations of data. And they are like `Promises`
 * in that they can asynchronously deliver values. But unlike a `Promise`, an
 * `Observable` can emit many values over time, and decides if/when it is completed.
 *
 * `Observable` is also being considered for inclusion in the
 * [ECMAScript spec](https://github.com/zenparsing/es-observable).
 *
 * ## Example
 *
 * A simple example of using an `Observable` is a timer `Observable`, which will
 * notify an `Observer` each time an interval has completed.
 *
 * {@example facade/ts/async/observable.ts region='Observable'}
 *
 * The `Observable` in Angular currently doesn't provide any combinators by default.
 * So it's necessary to explicitly import any combinators that an application requires.
 * There are two ways to import RxJS combinators: pure and patched. The "pure" approach
 * involves importing a combinator as a function every place that an application needs it,
 * then calling the function with the source observable as the context of the function.
 *
 * ## Example
 *
 * {@example facade/ts/async/observable_pure.ts region='Observable'}
 *
 * The "patched" approach to using combinators is to import a special module for
 * each combinator, which will automatically cause the combinator to be patched
 * to the `Observable` prototype, which will make it available to use anywhere in
 * an application after the combinator has been imported once.
 *
 * ## Example
 *
 * (Notice the extra "add" in the path to import `map`)
 *
 * {@example facade/ts/async/observable_patched.ts region='Observable'}
 *
 * Notice that the sequence of operations is now able to be expressed "left-to-right"
 * because `map` is on the `Observable` prototype. For a simple example like this one,
 * the left-to-right expression may seem insignificant. However, when several operators
 * are used in combination, the "callback tree" grows several levels deep, and becomes
 * difficult to read. For this reason, the "patched" approach is the recommended approach
 * to add new operators to `Observable`.
 *
 * For applications that are less sensitive about payload size, the set of core operators
 * can be patched onto the `Observable` prototype with a single import, by importing the
 * `rxjs` module.
 *
 * {@example facade/ts/async/observable_all.ts region='Observable'}
 *
 * Full documentation on RxJS `Observable` and available combinators can be found
 * in the RxJS [Observable docs](http://reactivex.io/RxJS/class/es6/Observable.js~Observable.html).
 *
 */
// todo(robwormald): ts2dart should handle this properly
var Observable = (function (_super) {
    __extends(Observable, _super);
    function Observable() {
        _super.apply(this, arguments);
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    return Observable;
})(Observable_1.Observable);
exports.Observable = Observable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jLnRzIl0sIm5hbWVzIjpbIlRpbWVyV3JhcHBlciIsIlRpbWVyV3JhcHBlci5jb25zdHJ1Y3RvciIsIlRpbWVyV3JhcHBlci5zZXRUaW1lb3V0IiwiVGltZXJXcmFwcGVyLmNsZWFyVGltZW91dCIsIlRpbWVyV3JhcHBlci5zZXRJbnRlcnZhbCIsIlRpbWVyV3JhcHBlci5jbGVhckludGVydmFsIiwiT2JzZXJ2YWJsZVdyYXBwZXIiLCJPYnNlcnZhYmxlV3JhcHBlci5jb25zdHJ1Y3RvciIsIk9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSIsIk9ic2VydmFibGVXcmFwcGVyLmlzT2JzZXJ2YWJsZSIsIk9ic2VydmFibGVXcmFwcGVyLmhhc1N1YnNjcmliZXJzIiwiT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSIsIk9ic2VydmFibGVXcmFwcGVyLmNhbGxOZXh0IiwiT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQiLCJPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IiLCJPYnNlcnZhYmxlV3JhcHBlci5jYWxsQ29tcGxldGUiLCJPYnNlcnZhYmxlV3JhcHBlci5mcm9tUHJvbWlzZSIsIk9ic2VydmFibGVXcmFwcGVyLnRvUHJvbWlzZSIsIkV2ZW50RW1pdHRlciIsIkV2ZW50RW1pdHRlci5jb25zdHJ1Y3RvciIsIkV2ZW50RW1pdHRlci5lbWl0IiwiRXZlbnRFbWl0dGVyLm5leHQiLCJFdmVudEVtaXR0ZXIuc3Vic2NyaWJlIiwiT2JzZXJ2YWJsZSIsIk9ic2VydmFibGUuY29uc3RydWN0b3IiLCJPYnNlcnZhYmxlLmxpZnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUJBQXNDLDBCQUEwQixDQUFDLENBQUE7QUFJakUsd0JBQXdELDZCQUE2QixDQUFDO0FBQTlFLGtEQUFjO0FBQUUsb0NBQThEO0FBRXRGLHdCQUFzQixjQUFjLENBQUMsQ0FBQTtB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QUVBLFVBQVVBLENBQUNBLENBQUNBO0lBQzNEQSxDQUFDQTtJQUNISixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2REQsRUFBcUMsaUJBQU8sRUF1RDNDO0FBdkRZLG9CQUFZLGVBdUR4QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkRHO0FBQ0gsd0RBQXdEO0FBQ3hEO0lBQW1DSyw4QkFBZUE7SUFBbERBO1FBQW1DQyw4QkFBZUE7SUFPbERBLENBQUNBO0lBTkNELHlCQUFJQSxHQUFKQSxVQUFXQSxRQUF3QkE7UUFDakNFLElBQU1BLFVBQVVBLEdBQUdBLElBQUlBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ3BDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6QkEsVUFBVUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDL0JBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUNIRixpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFQRCxFQUFtQyx1QkFBWSxFQU85QztBQVBZLGtCQUFVLGFBT3RCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2dsb2JhbCwgaXNQcmVzZW50LCBub29wfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuLy8gV2UgbWFrZSBzdXJlIHByb21pc2VzIGFyZSBpbiBhIHNlcGFyYXRlIGZpbGUgc28gdGhhdCB3ZSBjYW4gdXNlIHByb21pc2VzXG4vLyB3aXRob3V0IGRlcGVuZGluZyBvbiByeGpzLlxuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuZXhwb3J0IHtQcm9taXNlV3JhcHBlciwgUHJvbWlzZSwgUHJvbWlzZUNvbXBsZXRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzL1N1YmplY3QnO1xuaW1wb3J0IHtPYnNlcnZhYmxlIGFzIFJ4T2JzZXJ2YWJsZX0gZnJvbSAncnhqcy9PYnNlcnZhYmxlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzL1N1YnNjcmlwdGlvbic7XG5pbXBvcnQge09wZXJhdG9yfSBmcm9tICdyeGpzL09wZXJhdG9yJztcblxuaW1wb3J0IHtQcm9taXNlT2JzZXJ2YWJsZX0gZnJvbSAncnhqcy9vYnNlcnZhYmxlL2Zyb21Qcm9taXNlJztcbmltcG9ydCB7dG9Qcm9taXNlfSBmcm9tICdyeGpzL29wZXJhdG9yL3RvUHJvbWlzZSc7XG5cbmV4cG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcy9TdWJqZWN0JztcblxuZXhwb3J0IG5hbWVzcGFjZSBOb2RlSlMge1xuICBleHBvcnQgaW50ZXJmYWNlIFRpbWVyIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBUaW1lcldyYXBwZXIge1xuICBzdGF0aWMgc2V0VGltZW91dChmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLCBtaWxsaXM6IG51bWJlcik6IE5vZGVKUy5UaW1lciB7XG4gICAgcmV0dXJuIGdsb2JhbC5zZXRUaW1lb3V0KGZuLCBtaWxsaXMpO1xuICB9XG4gIHN0YXRpYyBjbGVhclRpbWVvdXQoaWQ6IE5vZGVKUy5UaW1lcik6IHZvaWQgeyBnbG9iYWwuY2xlYXJUaW1lb3V0KGlkKTsgfVxuXG4gIHN0YXRpYyBzZXRJbnRlcnZhbChmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLCBtaWxsaXM6IG51bWJlcik6IE5vZGVKUy5UaW1lciB7XG4gICAgcmV0dXJuIGdsb2JhbC5zZXRJbnRlcnZhbChmbiwgbWlsbGlzKTtcbiAgfVxuICBzdGF0aWMgY2xlYXJJbnRlcnZhbChpZDogTm9kZUpTLlRpbWVyKTogdm9pZCB7IGdsb2JhbC5jbGVhckludGVydmFsKGlkKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZVdyYXBwZXIge1xuICAvLyBUT0RPKHZzYXZraW4pOiB3aGVuIHdlIHVzZSByeG5leHQsIHRyeSBpbmZlcnJpbmcgdGhlIGdlbmVyaWMgdHlwZSBmcm9tIHRoZSBmaXJzdCBhcmdcbiAgc3RhdGljIHN1YnNjcmliZTxUPihlbWl0dGVyOiBhbnksIG9uTmV4dDogKHZhbHVlOiBUKSA9PiB2b2lkLCBvbkVycm9yPzogKGV4Y2VwdGlvbjogYW55KSA9PiB2b2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpID0+IHZvaWQgPSAoKSA9PiB7fSk6IE9iamVjdCB7XG4gICAgb25FcnJvciA9ICh0eXBlb2Ygb25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSAmJiBvbkVycm9yIHx8IG5vb3A7XG4gICAgb25Db21wbGV0ZSA9ICh0eXBlb2Ygb25Db21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSAmJiBvbkNvbXBsZXRlIHx8IG5vb3A7XG4gICAgcmV0dXJuIGVtaXR0ZXIuc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvbkVycm9yLCBjb21wbGV0ZTogb25Db21wbGV0ZX0pO1xuICB9XG5cbiAgc3RhdGljIGlzT2JzZXJ2YWJsZShvYnM6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gb2JzIGluc3RhbmNlb2YgUnhPYnNlcnZhYmxlOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBgb2JzYCBoYXMgYW55IHN1YnNjcmliZXJzIGxpc3RlbmluZyB0byBldmVudHMuXG4gICAqL1xuICBzdGF0aWMgaGFzU3Vic2NyaWJlcnMob2JzOiBFdmVudEVtaXR0ZXI8YW55Pik6IGJvb2xlYW4geyByZXR1cm4gb2JzLm9ic2VydmVycy5sZW5ndGggPiAwOyB9XG5cbiAgc3RhdGljIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBhbnkpIHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgLSB1c2UgY2FsbEVtaXQoKSBpbnN0ZWFkXG4gICAqL1xuICBzdGF0aWMgY2FsbE5leHQoZW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4sIHZhbHVlOiBhbnkpIHsgZW1pdHRlci5uZXh0KHZhbHVlKTsgfVxuXG4gIHN0YXRpYyBjYWxsRW1pdChlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiwgdmFsdWU6IGFueSkgeyBlbWl0dGVyLmVtaXQodmFsdWUpOyB9XG5cbiAgc3RhdGljIGNhbGxFcnJvcihlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiwgZXJyb3I6IGFueSkgeyBlbWl0dGVyLmVycm9yKGVycm9yKTsgfVxuXG4gIHN0YXRpYyBjYWxsQ29tcGxldGUoZW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4pIHsgZW1pdHRlci5jb21wbGV0ZSgpOyB9XG5cbiAgc3RhdGljIGZyb21Qcm9taXNlKHByb21pc2U6IFByb21pc2U8YW55Pik6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2VPYnNlcnZhYmxlLmNyZWF0ZShwcm9taXNlKTtcbiAgfVxuXG4gIHN0YXRpYyB0b1Byb21pc2Uob2JqOiBPYnNlcnZhYmxlPGFueT4pOiBQcm9taXNlPGFueT4geyByZXR1cm4gdG9Qcm9taXNlLmNhbGwob2JqKTsgfVxufVxuXG4vKipcbiAqIFVzZSBieSBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRvIGVtaXQgY3VzdG9tIEV2ZW50cy5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIGBaaXBweWAgYWx0ZXJuYXRpdmVseSBlbWl0cyBgb3BlbmAgYW5kIGBjbG9zZWAgZXZlbnRzIHdoZW4gaXRzXG4gKiB0aXRsZSBnZXRzIGNsaWNrZWQ6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd6aXBweScsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgIDxkaXYgY2xhc3M9XCJ6aXBweVwiPlxuICogICAgIDxkaXYgKGNsaWNrKT1cInRvZ2dsZSgpXCI+VG9nZ2xlPC9kaXY+XG4gKiAgICAgPGRpdiBbaGlkZGVuXT1cIiF2aXNpYmxlXCI+XG4gKiAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgICAgPC9kaXY+XG4gKiAgPC9kaXY+YH0pXG4gKiBleHBvcnQgY2xhc3MgWmlwcHkge1xuICogICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAqICAgQE91dHB1dCgpIG9wZW46IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgdG9nZ2xlKCkge1xuICogICAgIHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XG4gKiAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xuICogICAgICAgdGhpcy5vcGVuLmVtaXQobnVsbCk7XG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIHRoaXMuY2xvc2UuZW1pdChudWxsKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFVzZSBSeC5PYnNlcnZhYmxlIGJ1dCBwcm92aWRlcyBhbiBhZGFwdGVyIHRvIG1ha2UgaXQgd29yayBhcyBzcGVjaWZpZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qaHVzYWluL29ic2VydmFibGUtc3BlY1xuICpcbiAqIE9uY2UgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIHNwZWMgaXMgYXZhaWxhYmxlLCBzd2l0Y2ggdG8gaXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXI8VD4gZXh0ZW5kcyBTdWJqZWN0PFQ+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNBc3luYzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBbRXZlbnRFbWl0dGVyXSwgd2hpY2ggZGVwZW5kaW5nIG9uIFtpc0FzeW5jXSxcbiAgICogZGVsaXZlcnMgZXZlbnRzIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpc0FzeW5jOiBib29sZWFuID0gdHJ1ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faXNBc3luYyA9IGlzQXN5bmM7XG4gIH1cblxuICBlbWl0KHZhbHVlOiBUKSB7IHN1cGVyLm5leHQodmFsdWUpOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIC0gdXNlIC5lbWl0KHZhbHVlKSBpbnN0ZWFkXG4gICAqL1xuICBuZXh0KHZhbHVlOiBhbnkpIHsgc3VwZXIubmV4dCh2YWx1ZSk7IH1cblxuICBzdWJzY3JpYmUoZ2VuZXJhdG9yT3JOZXh0PzogYW55LCBlcnJvcj86IGFueSwgY29tcGxldGU/OiBhbnkpOiBhbnkge1xuICAgIGxldCBzY2hlZHVsZXJGbjtcbiAgICBsZXQgZXJyb3JGbiA9IChlcnI6IGFueSkgPT4gbnVsbDtcbiAgICBsZXQgY29tcGxldGVGbiA9ICgpID0+IG51bGw7XG5cbiAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0ICYmIHR5cGVvZiBnZW5lcmF0b3JPck5leHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX2lzQXN5bmMgPyAodmFsdWUpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQubmV4dCh2YWx1ZSkpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2YWx1ZSkgPT4geyBnZW5lcmF0b3JPck5leHQubmV4dCh2YWx1ZSk7IH07XG5cbiAgICAgIGlmIChnZW5lcmF0b3JPck5leHQuZXJyb3IpIHtcbiAgICAgICAgZXJyb3JGbiA9IHRoaXMuX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0LmVycm9yKGVycikpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5lcnJvcihlcnIpOyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKSB7XG4gICAgICAgIGNvbXBsZXRlRm4gPSB0aGlzLl9pc0FzeW5jID8gKCkgPT4geyBzZXRUaW1lb3V0KCgpID0+IGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSgpKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4geyBnZW5lcmF0b3JPck5leHQuY29tcGxldGUoKTsgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVyRm4gPSB0aGlzLl9pc0FzeW5jID8gKHZhbHVlKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlKSA9PiB7IGdlbmVyYXRvck9yTmV4dCh2YWx1ZSk7IH07XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBlcnJvckZuID1cbiAgICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZXJyb3IoZXJyKSk7IH0gOiAoZXJyKSA9PiB7IGVycm9yKGVycik7IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICBjb21wbGV0ZUZuID1cbiAgICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPyAoKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gY29tcGxldGUoKSk7IH0gOiAoKSA9PiB7IGNvbXBsZXRlKCk7IH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLnN1YnNjcmliZShzY2hlZHVsZXJGbiwgZXJyb3JGbiwgY29tcGxldGVGbik7XG4gIH1cbn1cblxuLyoqXG4gKiBBbGxvd3MgcHVibGlzaGluZyBhbmQgc3Vic2NyaWJpbmcgdG8gc2VyaWVzIG9mIGFzeW5jIHZhbHVlcy5cbiAqXG4gKiBUaGUgYE9ic2VydmFibGVgIGNsYXNzIGlzIGFuIGFsaWFzIHRvIHRoZSBgT2JzZXJ2YWJsZWAgcmV0dXJuZWQgZnJvbVxuICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdGl2ZXgvcnhqc30uIGBPYnNlcnZhYmxlc2AgYXJlIGEgbWVhbnMgb2YgZGVsaXZlcmluZ1xuICogYW55IG51bWJlciBvZiB2YWx1ZXMgb3ZlciBhbnkgcGVyaW9kIG9mIHRpbWUuIGBPYnNlcnZhYmxlc2AgY2FuIGJlIHRob3VnaHQgb2YgYXMgYVxuICogbWl4dHVyZSBvZiBgUHJvbWlzZWAgYW5kIGBBcnJheWAuIGBPYnNlcnZhYmxlc2AgYXJlIGxpa2UgYEFycmF5c2AgaW4gdGhhdCB0aGV5IGNhbiBoYXZlXG4gKiBjaGFpbmVkIGNvbWJpbmF0b3JzIC0tIGxpa2UgYG1hcGAsIGByZWR1Y2VgLCBhbmQgYGZpbHRlcmAgLS0gYXR0YWNoZWQgaW4gb3JkZXIgdG9cbiAqIHBlcmZvcm0gcHJvamVjdGlvbnMgYW5kIHRyYW5zZm9ybWF0aW9ucyBvZiBkYXRhLiBBbmQgdGhleSBhcmUgbGlrZSBgUHJvbWlzZXNgXG4gKiBpbiB0aGF0IHRoZXkgY2FuIGFzeW5jaHJvbm91c2x5IGRlbGl2ZXIgdmFsdWVzLiBCdXQgdW5saWtlIGEgYFByb21pc2VgLCBhblxuICogYE9ic2VydmFibGVgIGNhbiBlbWl0IG1hbnkgdmFsdWVzIG92ZXIgdGltZSwgYW5kIGRlY2lkZXMgaWYvd2hlbiBpdCBpcyBjb21wbGV0ZWQuXG4gKlxuICogYE9ic2VydmFibGVgIGlzIGFsc28gYmVpbmcgY29uc2lkZXJlZCBmb3IgaW5jbHVzaW9uIGluIHRoZVxuICogW0VDTUFTY3JpcHQgc3BlY10oaHR0cHM6Ly9naXRodWIuY29tL3plbnBhcnNpbmcvZXMtb2JzZXJ2YWJsZSkuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIEEgc2ltcGxlIGV4YW1wbGUgb2YgdXNpbmcgYW4gYE9ic2VydmFibGVgIGlzIGEgdGltZXIgYE9ic2VydmFibGVgLCB3aGljaCB3aWxsXG4gKiBub3RpZnkgYW4gYE9ic2VydmVyYCBlYWNoIHRpbWUgYW4gaW50ZXJ2YWwgaGFzIGNvbXBsZXRlZC5cbiAqXG4gKiB7QGV4YW1wbGUgZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGUudHMgcmVnaW9uPSdPYnNlcnZhYmxlJ31cbiAqXG4gKiBUaGUgYE9ic2VydmFibGVgIGluIEFuZ3VsYXIgY3VycmVudGx5IGRvZXNuJ3QgcHJvdmlkZSBhbnkgY29tYmluYXRvcnMgYnkgZGVmYXVsdC5cbiAqIFNvIGl0J3MgbmVjZXNzYXJ5IHRvIGV4cGxpY2l0bHkgaW1wb3J0IGFueSBjb21iaW5hdG9ycyB0aGF0IGFuIGFwcGxpY2F0aW9uIHJlcXVpcmVzLlxuICogVGhlcmUgYXJlIHR3byB3YXlzIHRvIGltcG9ydCBSeEpTIGNvbWJpbmF0b3JzOiBwdXJlIGFuZCBwYXRjaGVkLiBUaGUgXCJwdXJlXCIgYXBwcm9hY2hcbiAqIGludm9sdmVzIGltcG9ydGluZyBhIGNvbWJpbmF0b3IgYXMgYSBmdW5jdGlvbiBldmVyeSBwbGFjZSB0aGF0IGFuIGFwcGxpY2F0aW9uIG5lZWRzIGl0LFxuICogdGhlbiBjYWxsaW5nIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBzb3VyY2Ugb2JzZXJ2YWJsZSBhcyB0aGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBmYWNhZGUvdHMvYXN5bmMvb2JzZXJ2YWJsZV9wdXJlLnRzIHJlZ2lvbj0nT2JzZXJ2YWJsZSd9XG4gKlxuICogVGhlIFwicGF0Y2hlZFwiIGFwcHJvYWNoIHRvIHVzaW5nIGNvbWJpbmF0b3JzIGlzIHRvIGltcG9ydCBhIHNwZWNpYWwgbW9kdWxlIGZvclxuICogZWFjaCBjb21iaW5hdG9yLCB3aGljaCB3aWxsIGF1dG9tYXRpY2FsbHkgY2F1c2UgdGhlIGNvbWJpbmF0b3IgdG8gYmUgcGF0Y2hlZFxuICogdG8gdGhlIGBPYnNlcnZhYmxlYCBwcm90b3R5cGUsIHdoaWNoIHdpbGwgbWFrZSBpdCBhdmFpbGFibGUgdG8gdXNlIGFueXdoZXJlIGluXG4gKiBhbiBhcHBsaWNhdGlvbiBhZnRlciB0aGUgY29tYmluYXRvciBoYXMgYmVlbiBpbXBvcnRlZCBvbmNlLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiAoTm90aWNlIHRoZSBleHRyYSBcImFkZFwiIGluIHRoZSBwYXRoIHRvIGltcG9ydCBgbWFwYClcbiAqXG4gKiB7QGV4YW1wbGUgZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGVfcGF0Y2hlZC50cyByZWdpb249J09ic2VydmFibGUnfVxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBzZXF1ZW5jZSBvZiBvcGVyYXRpb25zIGlzIG5vdyBhYmxlIHRvIGJlIGV4cHJlc3NlZCBcImxlZnQtdG8tcmlnaHRcIlxuICogYmVjYXVzZSBgbWFwYCBpcyBvbiB0aGUgYE9ic2VydmFibGVgIHByb3RvdHlwZS4gRm9yIGEgc2ltcGxlIGV4YW1wbGUgbGlrZSB0aGlzIG9uZSxcbiAqIHRoZSBsZWZ0LXRvLXJpZ2h0IGV4cHJlc3Npb24gbWF5IHNlZW0gaW5zaWduaWZpY2FudC4gSG93ZXZlciwgd2hlbiBzZXZlcmFsIG9wZXJhdG9yc1xuICogYXJlIHVzZWQgaW4gY29tYmluYXRpb24sIHRoZSBcImNhbGxiYWNrIHRyZWVcIiBncm93cyBzZXZlcmFsIGxldmVscyBkZWVwLCBhbmQgYmVjb21lc1xuICogZGlmZmljdWx0IHRvIHJlYWQuIEZvciB0aGlzIHJlYXNvbiwgdGhlIFwicGF0Y2hlZFwiIGFwcHJvYWNoIGlzIHRoZSByZWNvbW1lbmRlZCBhcHByb2FjaFxuICogdG8gYWRkIG5ldyBvcGVyYXRvcnMgdG8gYE9ic2VydmFibGVgLlxuICpcbiAqIEZvciBhcHBsaWNhdGlvbnMgdGhhdCBhcmUgbGVzcyBzZW5zaXRpdmUgYWJvdXQgcGF5bG9hZCBzaXplLCB0aGUgc2V0IG9mIGNvcmUgb3BlcmF0b3JzXG4gKiBjYW4gYmUgcGF0Y2hlZCBvbnRvIHRoZSBgT2JzZXJ2YWJsZWAgcHJvdG90eXBlIHdpdGggYSBzaW5nbGUgaW1wb3J0LCBieSBpbXBvcnRpbmcgdGhlXG4gKiBgcnhqc2AgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSBmYWNhZGUvdHMvYXN5bmMvb2JzZXJ2YWJsZV9hbGwudHMgcmVnaW9uPSdPYnNlcnZhYmxlJ31cbiAqXG4gKiBGdWxsIGRvY3VtZW50YXRpb24gb24gUnhKUyBgT2JzZXJ2YWJsZWAgYW5kIGF2YWlsYWJsZSBjb21iaW5hdG9ycyBjYW4gYmUgZm91bmRcbiAqIGluIHRoZSBSeEpTIFtPYnNlcnZhYmxlIGRvY3NdKGh0dHA6Ly9yZWFjdGl2ZXguaW8vUnhKUy9jbGFzcy9lczYvT2JzZXJ2YWJsZS5qc35PYnNlcnZhYmxlLmh0bWwpLlxuICpcbiAqL1xuLy8gdG9kbyhyb2J3b3JtYWxkKTogdHMyZGFydCBzaG91bGQgaGFuZGxlIHRoaXMgcHJvcGVybHlcbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlPFQ+IGV4dGVuZHMgUnhPYnNlcnZhYmxlPFQ+IHtcbiAgbGlmdDxULCBSPihvcGVyYXRvcjogT3BlcmF0b3I8VCwgUj4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBjb25zdCBvYnNlcnZhYmxlID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICBvYnNlcnZhYmxlLnNvdXJjZSA9IHRoaXM7XG4gICAgb2JzZXJ2YWJsZS5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICB9XG59XG4iXX0=