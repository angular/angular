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
    ObservableWrapper.isObservable = function (obs) { return !!obs.subscribe; };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jLnRzIl0sIm5hbWVzIjpbIlRpbWVyV3JhcHBlciIsIlRpbWVyV3JhcHBlci5jb25zdHJ1Y3RvciIsIlRpbWVyV3JhcHBlci5zZXRUaW1lb3V0IiwiVGltZXJXcmFwcGVyLmNsZWFyVGltZW91dCIsIlRpbWVyV3JhcHBlci5zZXRJbnRlcnZhbCIsIlRpbWVyV3JhcHBlci5jbGVhckludGVydmFsIiwiT2JzZXJ2YWJsZVdyYXBwZXIiLCJPYnNlcnZhYmxlV3JhcHBlci5jb25zdHJ1Y3RvciIsIk9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSIsIk9ic2VydmFibGVXcmFwcGVyLmlzT2JzZXJ2YWJsZSIsIk9ic2VydmFibGVXcmFwcGVyLmhhc1N1YnNjcmliZXJzIiwiT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSIsIk9ic2VydmFibGVXcmFwcGVyLmNhbGxOZXh0IiwiT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQiLCJPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IiLCJPYnNlcnZhYmxlV3JhcHBlci5jYWxsQ29tcGxldGUiLCJPYnNlcnZhYmxlV3JhcHBlci5mcm9tUHJvbWlzZSIsIk9ic2VydmFibGVXcmFwcGVyLnRvUHJvbWlzZSIsIkV2ZW50RW1pdHRlciIsIkV2ZW50RW1pdHRlci5jb25zdHJ1Y3RvciIsIkV2ZW50RW1pdHRlci5lbWl0IiwiRXZlbnRFbWl0dGVyLm5leHQiLCJFdmVudEVtaXR0ZXIuc3Vic2NyaWJlIiwiT2JzZXJ2YWJsZSIsIk9ic2VydmFibGUuY29uc3RydWN0b3IiLCJPYnNlcnZhYmxlLmxpZnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUJBQXNDLDBCQUEwQixDQUFDLENBQUE7QUFJakUsd0JBQXdELDZCQUE2QixDQUFDO0FBQTlFLGtEQUFjO0FBQUUsb0NBQThEO0FBRXRGLHdCQUFzQixjQUFjLENBQUMsQ0FBQTtB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RUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDM0RBLENBQUNBO0lBQ0hKLG1CQUFDQTtBQUFEQSxDQUFDQSxBQXZERCxFQUFxQyxpQkFBTyxFQXVEM0M7QUF2RFksb0JBQVksZUF1RHhCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyREc7QUFDSCx3REFBd0Q7QUFDeEQ7SUFBbUNLLDhCQUFlQTtJQUFsREE7UUFBbUNDLDhCQUFlQTtJQU9sREEsQ0FBQ0E7SUFOQ0QseUJBQUlBLEdBQUpBLFVBQVdBLFFBQXdCQTtRQUNqQ0UsSUFBTUEsVUFBVUEsR0FBR0EsSUFBSUEsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDcENBLFVBQVVBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pCQSxVQUFVQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUMvQkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBQ0hGLGlCQUFDQTtBQUFEQSxDQUFDQSxBQVBELEVBQW1DLHVCQUFZLEVBTzlDO0FBUFksa0JBQVUsYUFPdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Z2xvYmFsLCBpc1ByZXNlbnQsIG5vb3B9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG4vLyBXZSBtYWtlIHN1cmUgcHJvbWlzZXMgYXJlIGluIGEgc2VwYXJhdGUgZmlsZSBzbyB0aGF0IHdlIGNhbiB1c2UgcHJvbWlzZXNcbi8vIHdpdGhvdXQgZGVwZW5kaW5nIG9uIHJ4anMuXG5pbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvcHJvbWlzZSc7XG5leHBvcnQge1Byb21pc2VXcmFwcGVyLCBQcm9taXNlLCBQcm9taXNlQ29tcGxldGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQge09ic2VydmFibGUgYXMgUnhPYnNlcnZhYmxlfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMvU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7T3BlcmF0b3J9IGZyb20gJ3J4anMvT3BlcmF0b3InO1xuXG5pbXBvcnQge1Byb21pc2VPYnNlcnZhYmxlfSBmcm9tICdyeGpzL29ic2VydmFibGUvZnJvbVByb21pc2UnO1xuaW1wb3J0IHt0b1Byb21pc2V9IGZyb20gJ3J4anMvb3BlcmF0b3IvdG9Qcm9taXNlJztcblxuZXhwb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzL1N1YmplY3QnO1xuXG5leHBvcnQgbmFtZXNwYWNlIE5vZGVKUyB7XG4gIGV4cG9ydCBpbnRlcmZhY2UgVGltZXIge31cbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVyV3JhcHBlciB7XG4gIHN0YXRpYyBzZXRUaW1lb3V0KGZuOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQsIG1pbGxpczogbnVtYmVyKTogTm9kZUpTLlRpbWVyIHtcbiAgICByZXR1cm4gZ2xvYmFsLnNldFRpbWVvdXQoZm4sIG1pbGxpcyk7XG4gIH1cbiAgc3RhdGljIGNsZWFyVGltZW91dChpZDogTm9kZUpTLlRpbWVyKTogdm9pZCB7IGdsb2JhbC5jbGVhclRpbWVvdXQoaWQpOyB9XG5cbiAgc3RhdGljIHNldEludGVydmFsKGZuOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQsIG1pbGxpczogbnVtYmVyKTogTm9kZUpTLlRpbWVyIHtcbiAgICByZXR1cm4gZ2xvYmFsLnNldEludGVydmFsKGZuLCBtaWxsaXMpO1xuICB9XG4gIHN0YXRpYyBjbGVhckludGVydmFsKGlkOiBOb2RlSlMuVGltZXIpOiB2b2lkIHsgZ2xvYmFsLmNsZWFySW50ZXJ2YWwoaWQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlV3JhcHBlciB7XG4gIC8vIFRPRE8odnNhdmtpbik6IHdoZW4gd2UgdXNlIHJ4bmV4dCwgdHJ5IGluZmVycmluZyB0aGUgZ2VuZXJpYyB0eXBlIGZyb20gdGhlIGZpcnN0IGFyZ1xuICBzdGF0aWMgc3Vic2NyaWJlPFQ+KGVtaXR0ZXI6IGFueSwgb25OZXh0OiAodmFsdWU6IFQpID0+IHZvaWQsIG9uRXJyb3I/OiAoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQsXG4gICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZTogKCkgPT4gdm9pZCA9ICgpID0+IHt9KTogT2JqZWN0IHtcbiAgICBvbkVycm9yID0gKHR5cGVvZiBvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpICYmIG9uRXJyb3IgfHwgbm9vcDtcbiAgICBvbkNvbXBsZXRlID0gKHR5cGVvZiBvbkNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpICYmIG9uQ29tcGxldGUgfHwgbm9vcDtcbiAgICByZXR1cm4gZW1pdHRlci5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uRXJyb3IsIGNvbXBsZXRlOiBvbkNvbXBsZXRlfSk7XG4gIH1cblxuICBzdGF0aWMgaXNPYnNlcnZhYmxlKG9iczogYW55KTogYm9vbGVhbiB7IHJldHVybiAhIW9icy5zdWJzY3JpYmU7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGBvYnNgIGhhcyBhbnkgc3Vic2NyaWJlcnMgbGlzdGVuaW5nIHRvIGV2ZW50cy5cbiAgICovXG4gIHN0YXRpYyBoYXNTdWJzY3JpYmVycyhvYnM6IEV2ZW50RW1pdHRlcjxhbnk+KTogYm9vbGVhbiB7IHJldHVybiBvYnMub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7IH1cblxuICBzdGF0aWMgZGlzcG9zZShzdWJzY3JpcHRpb246IGFueSkgeyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCAtIHVzZSBjYWxsRW1pdCgpIGluc3RlYWRcbiAgICovXG4gIHN0YXRpYyBjYWxsTmV4dChlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiwgdmFsdWU6IGFueSkgeyBlbWl0dGVyLm5leHQodmFsdWUpOyB9XG5cbiAgc3RhdGljIGNhbGxFbWl0KGVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+LCB2YWx1ZTogYW55KSB7IGVtaXR0ZXIuZW1pdCh2YWx1ZSk7IH1cblxuICBzdGF0aWMgY2FsbEVycm9yKGVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+LCBlcnJvcjogYW55KSB7IGVtaXR0ZXIuZXJyb3IoZXJyb3IpOyB9XG5cbiAgc3RhdGljIGNhbGxDb21wbGV0ZShlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PikgeyBlbWl0dGVyLmNvbXBsZXRlKCk7IH1cblxuICBzdGF0aWMgZnJvbVByb21pc2UocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZU9ic2VydmFibGUuY3JlYXRlKHByb21pc2UpO1xuICB9XG5cbiAgc3RhdGljIHRvUHJvbWlzZShvYmo6IE9ic2VydmFibGU8YW55Pik6IFByb21pc2U8YW55PiB7IHJldHVybiB0b1Byb21pc2UuY2FsbChvYmopOyB9XG59XG5cbi8qKlxuICogVXNlIGJ5IGRpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudHMgdG8gZW1pdCBjdXN0b20gRXZlbnRzLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYFppcHB5YCBhbHRlcm5hdGl2ZWx5IGVtaXRzIGBvcGVuYCBhbmQgYGNsb3NlYCBldmVudHMgd2hlbiBpdHNcbiAqIHRpdGxlIGdldHMgY2xpY2tlZDpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3ppcHB5JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgPGRpdiBjbGFzcz1cInppcHB5XCI+XG4gKiAgICAgPGRpdiAoY2xpY2spPVwidG9nZ2xlKClcIj5Ub2dnbGU8L2Rpdj5cbiAqICAgICA8ZGl2IFtoaWRkZW5dPVwiIXZpc2libGVcIj5cbiAqICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAqICAgICA8L2Rpdj5cbiAqICA8L2Rpdj5gfSlcbiAqIGV4cG9ydCBjbGFzcyBaaXBweSB7XG4gKiAgIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICogICBAT3V0cHV0KCkgb3BlbjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoKSBjbG9zZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcbiAqICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gKiAgICAgICB0aGlzLm9wZW4uZW1pdChudWxsKTtcbiAqICAgICB9IGVsc2Uge1xuICogICAgICAgdGhpcy5jbG9zZS5lbWl0KG51bGwpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVXNlIFJ4Lk9ic2VydmFibGUgYnV0IHByb3ZpZGVzIGFuIGFkYXB0ZXIgdG8gbWFrZSBpdCB3b3JrIGFzIHNwZWNpZmllZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2podXNhaW4vb2JzZXJ2YWJsZS1zcGVjXG4gKlxuICogT25jZSBhIHJlZmVyZW5jZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc3BlYyBpcyBhdmFpbGFibGUsIHN3aXRjaCB0byBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50RW1pdHRlcjxUPiBleHRlbmRzIFN1YmplY3Q8VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9pc0FzeW5jOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFtFdmVudEVtaXR0ZXJdLCB3aGljaCBkZXBlbmRpbmcgb24gW2lzQXN5bmNdLFxuICAgKiBkZWxpdmVycyBldmVudHMgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25vdXNseS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlzQXN5bmM6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pc0FzeW5jID0gaXNBc3luYztcbiAgfVxuXG4gIGVtaXQodmFsdWU6IFQpIHsgc3VwZXIubmV4dCh2YWx1ZSk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgLSB1c2UgLmVtaXQodmFsdWUpIGluc3RlYWRcbiAgICovXG4gIG5leHQodmFsdWU6IGFueSkgeyBzdXBlci5uZXh0KHZhbHVlKTsgfVxuXG4gIHN1YnNjcmliZShnZW5lcmF0b3JPck5leHQ/OiBhbnksIGVycm9yPzogYW55LCBjb21wbGV0ZT86IGFueSk6IGFueSB7XG4gICAgbGV0IHNjaGVkdWxlckZuO1xuICAgIGxldCBlcnJvckZuID0gKGVycjogYW55KSA9PiBudWxsO1xuICAgIGxldCBjb21wbGV0ZUZuID0gKCkgPT4gbnVsbDtcblxuICAgIGlmIChnZW5lcmF0b3JPck5leHQgJiYgdHlwZW9mIGdlbmVyYXRvck9yTmV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHNjaGVkdWxlckZuID0gdGhpcy5faXNBc3luYyA/ICh2YWx1ZSkgPT4geyBzZXRUaW1lb3V0KCgpID0+IGdlbmVyYXRvck9yTmV4dC5uZXh0KHZhbHVlKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5uZXh0KHZhbHVlKTsgfTtcblxuICAgICAgaWYgKGdlbmVyYXRvck9yTmV4dC5lcnJvcikge1xuICAgICAgICBlcnJvckZuID0gdGhpcy5faXNBc3luYyA/IChlcnIpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQuZXJyb3IoZXJyKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnIpID0+IHsgZ2VuZXJhdG9yT3JOZXh0LmVycm9yKGVycik7IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChnZW5lcmF0b3JPck5leHQuY29tcGxldGUpIHtcbiAgICAgICAgY29tcGxldGVGbiA9IHRoaXMuX2lzQXN5bmMgPyAoKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKCkpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSgpOyB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX2lzQXN5bmMgPyAodmFsdWUpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQodmFsdWUpKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodmFsdWUpID0+IHsgZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKTsgfTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGVycm9yRm4gPVxuICAgICAgICAgICAgdGhpcy5faXNBc3luYyA/IChlcnIpID0+IHsgc2V0VGltZW91dCgoKSA9PiBlcnJvcihlcnIpKTsgfSA6IChlcnIpID0+IHsgZXJyb3IoZXJyKTsgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgIGNvbXBsZXRlRm4gPVxuICAgICAgICAgICAgdGhpcy5faXNBc3luYyA/ICgpID0+IHsgc2V0VGltZW91dCgoKSA9PiBjb21wbGV0ZSgpKTsgfSA6ICgpID0+IHsgY29tcGxldGUoKTsgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuc3Vic2NyaWJlKHNjaGVkdWxlckZuLCBlcnJvckZuLCBjb21wbGV0ZUZuKTtcbiAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBwdWJsaXNoaW5nIGFuZCBzdWJzY3JpYmluZyB0byBzZXJpZXMgb2YgYXN5bmMgdmFsdWVzLlxuICpcbiAqIFRoZSBgT2JzZXJ2YWJsZWAgY2xhc3MgaXMgYW4gYWxpYXMgdG8gdGhlIGBPYnNlcnZhYmxlYCByZXR1cm5lZCBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0aXZleC9yeGpzfS4gYE9ic2VydmFibGVzYCBhcmUgYSBtZWFucyBvZiBkZWxpdmVyaW5nXG4gKiBhbnkgbnVtYmVyIG9mIHZhbHVlcyBvdmVyIGFueSBwZXJpb2Qgb2YgdGltZS4gYE9ic2VydmFibGVzYCBjYW4gYmUgdGhvdWdodCBvZiBhcyBhXG4gKiBtaXh0dXJlIG9mIGBQcm9taXNlYCBhbmQgYEFycmF5YC4gYE9ic2VydmFibGVzYCBhcmUgbGlrZSBgQXJyYXlzYCBpbiB0aGF0IHRoZXkgY2FuIGhhdmVcbiAqIGNoYWluZWQgY29tYmluYXRvcnMgLS0gbGlrZSBgbWFwYCwgYHJlZHVjZWAsIGFuZCBgZmlsdGVyYCAtLSBhdHRhY2hlZCBpbiBvcmRlciB0b1xuICogcGVyZm9ybSBwcm9qZWN0aW9ucyBhbmQgdHJhbnNmb3JtYXRpb25zIG9mIGRhdGEuIEFuZCB0aGV5IGFyZSBsaWtlIGBQcm9taXNlc2BcbiAqIGluIHRoYXQgdGhleSBjYW4gYXN5bmNocm9ub3VzbHkgZGVsaXZlciB2YWx1ZXMuIEJ1dCB1bmxpa2UgYSBgUHJvbWlzZWAsIGFuXG4gKiBgT2JzZXJ2YWJsZWAgY2FuIGVtaXQgbWFueSB2YWx1ZXMgb3ZlciB0aW1lLCBhbmQgZGVjaWRlcyBpZi93aGVuIGl0IGlzIGNvbXBsZXRlZC5cbiAqXG4gKiBgT2JzZXJ2YWJsZWAgaXMgYWxzbyBiZWluZyBjb25zaWRlcmVkIGZvciBpbmNsdXNpb24gaW4gdGhlXG4gKiBbRUNNQVNjcmlwdCBzcGVjXShodHRwczovL2dpdGh1Yi5jb20vemVucGFyc2luZy9lcy1vYnNlcnZhYmxlKS5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICogQSBzaW1wbGUgZXhhbXBsZSBvZiB1c2luZyBhbiBgT2JzZXJ2YWJsZWAgaXMgYSB0aW1lciBgT2JzZXJ2YWJsZWAsIHdoaWNoIHdpbGxcbiAqIG5vdGlmeSBhbiBgT2JzZXJ2ZXJgIGVhY2ggdGltZSBhbiBpbnRlcnZhbCBoYXMgY29tcGxldGVkLlxuICpcbiAqIHtAZXhhbXBsZSBmYWNhZGUvdHMvYXN5bmMvb2JzZXJ2YWJsZS50cyByZWdpb249J09ic2VydmFibGUnfVxuICpcbiAqIFRoZSBgT2JzZXJ2YWJsZWAgaW4gQW5ndWxhciBjdXJyZW50bHkgZG9lc24ndCBwcm92aWRlIGFueSBjb21iaW5hdG9ycyBieSBkZWZhdWx0LlxuICogU28gaXQncyBuZWNlc3NhcnkgdG8gZXhwbGljaXRseSBpbXBvcnQgYW55IGNvbWJpbmF0b3JzIHRoYXQgYW4gYXBwbGljYXRpb24gcmVxdWlyZXMuXG4gKiBUaGVyZSBhcmUgdHdvIHdheXMgdG8gaW1wb3J0IFJ4SlMgY29tYmluYXRvcnM6IHB1cmUgYW5kIHBhdGNoZWQuIFRoZSBcInB1cmVcIiBhcHByb2FjaFxuICogaW52b2x2ZXMgaW1wb3J0aW5nIGEgY29tYmluYXRvciBhcyBhIGZ1bmN0aW9uIGV2ZXJ5IHBsYWNlIHRoYXQgYW4gYXBwbGljYXRpb24gbmVlZHMgaXQsXG4gKiB0aGVuIGNhbGxpbmcgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIHNvdXJjZSBvYnNlcnZhYmxlIGFzIHRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGZhY2FkZS90cy9hc3luYy9vYnNlcnZhYmxlX3B1cmUudHMgcmVnaW9uPSdPYnNlcnZhYmxlJ31cbiAqXG4gKiBUaGUgXCJwYXRjaGVkXCIgYXBwcm9hY2ggdG8gdXNpbmcgY29tYmluYXRvcnMgaXMgdG8gaW1wb3J0IGEgc3BlY2lhbCBtb2R1bGUgZm9yXG4gKiBlYWNoIGNvbWJpbmF0b3IsIHdoaWNoIHdpbGwgYXV0b21hdGljYWxseSBjYXVzZSB0aGUgY29tYmluYXRvciB0byBiZSBwYXRjaGVkXG4gKiB0byB0aGUgYE9ic2VydmFibGVgIHByb3RvdHlwZSwgd2hpY2ggd2lsbCBtYWtlIGl0IGF2YWlsYWJsZSB0byB1c2UgYW55d2hlcmUgaW5cbiAqIGFuIGFwcGxpY2F0aW9uIGFmdGVyIHRoZSBjb21iaW5hdG9yIGhhcyBiZWVuIGltcG9ydGVkIG9uY2UuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIChOb3RpY2UgdGhlIGV4dHJhIFwiYWRkXCIgaW4gdGhlIHBhdGggdG8gaW1wb3J0IGBtYXBgKVxuICpcbiAqIHtAZXhhbXBsZSBmYWNhZGUvdHMvYXN5bmMvb2JzZXJ2YWJsZV9wYXRjaGVkLnRzIHJlZ2lvbj0nT2JzZXJ2YWJsZSd9XG4gKlxuICogTm90aWNlIHRoYXQgdGhlIHNlcXVlbmNlIG9mIG9wZXJhdGlvbnMgaXMgbm93IGFibGUgdG8gYmUgZXhwcmVzc2VkIFwibGVmdC10by1yaWdodFwiXG4gKiBiZWNhdXNlIGBtYXBgIGlzIG9uIHRoZSBgT2JzZXJ2YWJsZWAgcHJvdG90eXBlLiBGb3IgYSBzaW1wbGUgZXhhbXBsZSBsaWtlIHRoaXMgb25lLFxuICogdGhlIGxlZnQtdG8tcmlnaHQgZXhwcmVzc2lvbiBtYXkgc2VlbSBpbnNpZ25pZmljYW50LiBIb3dldmVyLCB3aGVuIHNldmVyYWwgb3BlcmF0b3JzXG4gKiBhcmUgdXNlZCBpbiBjb21iaW5hdGlvbiwgdGhlIFwiY2FsbGJhY2sgdHJlZVwiIGdyb3dzIHNldmVyYWwgbGV2ZWxzIGRlZXAsIGFuZCBiZWNvbWVzXG4gKiBkaWZmaWN1bHQgdG8gcmVhZC4gRm9yIHRoaXMgcmVhc29uLCB0aGUgXCJwYXRjaGVkXCIgYXBwcm9hY2ggaXMgdGhlIHJlY29tbWVuZGVkIGFwcHJvYWNoXG4gKiB0byBhZGQgbmV3IG9wZXJhdG9ycyB0byBgT2JzZXJ2YWJsZWAuXG4gKlxuICogRm9yIGFwcGxpY2F0aW9ucyB0aGF0IGFyZSBsZXNzIHNlbnNpdGl2ZSBhYm91dCBwYXlsb2FkIHNpemUsIHRoZSBzZXQgb2YgY29yZSBvcGVyYXRvcnNcbiAqIGNhbiBiZSBwYXRjaGVkIG9udG8gdGhlIGBPYnNlcnZhYmxlYCBwcm90b3R5cGUgd2l0aCBhIHNpbmdsZSBpbXBvcnQsIGJ5IGltcG9ydGluZyB0aGVcbiAqIGByeGpzYCBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIGZhY2FkZS90cy9hc3luYy9vYnNlcnZhYmxlX2FsbC50cyByZWdpb249J09ic2VydmFibGUnfVxuICpcbiAqIEZ1bGwgZG9jdW1lbnRhdGlvbiBvbiBSeEpTIGBPYnNlcnZhYmxlYCBhbmQgYXZhaWxhYmxlIGNvbWJpbmF0b3JzIGNhbiBiZSBmb3VuZFxuICogaW4gdGhlIFJ4SlMgW09ic2VydmFibGUgZG9jc10oaHR0cDovL3JlYWN0aXZleC5pby9SeEpTL2NsYXNzL2VzNi9PYnNlcnZhYmxlLmpzfk9ic2VydmFibGUuaHRtbCkuXG4gKlxuICovXG4vLyB0b2RvKHJvYndvcm1hbGQpOiB0czJkYXJ0IHNob3VsZCBoYW5kbGUgdGhpcyBwcm9wZXJseVxuZXhwb3J0IGNsYXNzIE9ic2VydmFibGU8VD4gZXh0ZW5kcyBSeE9ic2VydmFibGU8VD4ge1xuICBsaWZ0PFQsIFI+KG9wZXJhdG9yOiBPcGVyYXRvcjxULCBSPik6IE9ic2VydmFibGU8VD4ge1xuICAgIGNvbnN0IG9ic2VydmFibGUgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICBvYnNlcnZhYmxlLm9wZXJhdG9yID0gb3BlcmF0b3I7XG4gICAgcmV0dXJuIG9ic2VydmFibGU7XG4gIH1cbn1cbiJdfQ==