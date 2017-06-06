'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
exports.PromiseWrapper = promise_1.PromiseWrapper;
exports.PromiseCompleter = promise_1.PromiseCompleter;
var Subject_1 = require('rxjs/Subject');
var PromiseObservable_1 = require('rxjs/observable/PromiseObservable');
var toPromise_1 = require('rxjs/operator/toPromise');
var Observable_1 = require('rxjs/Observable');
exports.Observable = Observable_1.Observable;
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
}());
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
        return PromiseObservable_1.PromiseObservable.create(promise);
    };
    ObservableWrapper.toPromise = function (obj) { return toPromise_1.toPromise.call(obj); };
    return ObservableWrapper;
}());
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
}(Subject_1.Subject));
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUEyQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3RELHdCQUErQyw2QkFBNkIsQ0FBQztBQUFyRSxrREFBYztBQUFFLHNEQUFxRDtBQUc3RSx3QkFBc0IsY0FBYyxDQUFDLENBQUE7QUFFckMsa0NBQWdDLG1DQUFtQyxDQUFDLENBQUE7QUFDcEUsMEJBQXdCLHlCQUF5QixDQUFDLENBQUE7QUFFbEQsMkJBQXlCLGlCQUFpQixDQUFDO0FBQW5DLDZDQUFtQztBQUMzQyx3QkFBc0IsY0FBYyxDQUFDO0FBQTdCLG9DQUE2QjtBQUVyQztJQUFBO0lBVUEsQ0FBQztJQVRRLHVCQUFVLEdBQWpCLFVBQWtCLEVBQTRCLEVBQUUsTUFBYztRQUM1RCxNQUFNLENBQUMsYUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNNLHlCQUFZLEdBQW5CLFVBQW9CLEVBQVUsSUFBVSxhQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRCx3QkFBVyxHQUFsQixVQUFtQixFQUE0QixFQUFFLE1BQWM7UUFDN0QsTUFBTSxDQUFDLGFBQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDTSwwQkFBYSxHQUFwQixVQUFxQixFQUFVLElBQVUsYUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsbUJBQUM7QUFBRCxDQUFDLEFBVkQsSUFVQztBQVZZLG9CQUFZLGVBVXhCLENBQUE7QUFFRDtJQUFBO0lBa0NBLENBQUM7SUFqQ0MsdUZBQXVGO0lBQ2hG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QUMsQ0FBQyxDQUFDLENBQUM7WUFFckUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPO29CQUNILElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBQyxHQUFHLElBQU8sVUFBVSxDQUFDLGNBQU0sT0FBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQVYsQ0FBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBQyxHQUFHLElBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNiLFVBQVU7b0JBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFRLFVBQVUsQ0FBQyxjQUFNLE9BQUEsUUFBUSxFQUFFLEVBQVYsQ0FBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBUSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxnQkFBSyxDQUFDLFNBQVMsWUFBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF2REQsQ0FBcUMsaUJBQU8sR0F1RDNDO0FBdkRZLG9CQUFZLGVBdUR4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtnbG9iYWwsIG5vb3B9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5leHBvcnQge1Byb21pc2VXcmFwcGVyLCBQcm9taXNlQ29tcGxldGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5cbmltcG9ydCB7UHJvbWlzZU9ic2VydmFibGV9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS9Qcm9taXNlT2JzZXJ2YWJsZSc7XG5pbXBvcnQge3RvUHJvbWlzZX0gZnJvbSAncnhqcy9vcGVyYXRvci90b1Byb21pc2UnO1xuXG5leHBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5leHBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBUaW1lcldyYXBwZXIge1xuICBzdGF0aWMgc2V0VGltZW91dChmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLCBtaWxsaXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGdsb2JhbC5zZXRUaW1lb3V0KGZuLCBtaWxsaXMpO1xuICB9XG4gIHN0YXRpYyBjbGVhclRpbWVvdXQoaWQ6IG51bWJlcik6IHZvaWQgeyBnbG9iYWwuY2xlYXJUaW1lb3V0KGlkKTsgfVxuXG4gIHN0YXRpYyBzZXRJbnRlcnZhbChmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLCBtaWxsaXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGdsb2JhbC5zZXRJbnRlcnZhbChmbiwgbWlsbGlzKTtcbiAgfVxuICBzdGF0aWMgY2xlYXJJbnRlcnZhbChpZDogbnVtYmVyKTogdm9pZCB7IGdsb2JhbC5jbGVhckludGVydmFsKGlkKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZVdyYXBwZXIge1xuICAvLyBUT0RPKHZzYXZraW4pOiB3aGVuIHdlIHVzZSByeG5leHQsIHRyeSBpbmZlcnJpbmcgdGhlIGdlbmVyaWMgdHlwZSBmcm9tIHRoZSBmaXJzdCBhcmdcbiAgc3RhdGljIHN1YnNjcmliZTxUPihlbWl0dGVyOiBhbnksIG9uTmV4dDogKHZhbHVlOiBUKSA9PiB2b2lkLCBvbkVycm9yPzogKGV4Y2VwdGlvbjogYW55KSA9PiB2b2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpID0+IHZvaWQgPSAoKSA9PiB7fSk6IE9iamVjdCB7XG4gICAgb25FcnJvciA9ICh0eXBlb2Ygb25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSAmJiBvbkVycm9yIHx8IG5vb3A7XG4gICAgb25Db21wbGV0ZSA9ICh0eXBlb2Ygb25Db21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSAmJiBvbkNvbXBsZXRlIHx8IG5vb3A7XG4gICAgcmV0dXJuIGVtaXR0ZXIuc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvbkVycm9yLCBjb21wbGV0ZTogb25Db21wbGV0ZX0pO1xuICB9XG5cbiAgc3RhdGljIGlzT2JzZXJ2YWJsZShvYnM6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gISFvYnMuc3Vic2NyaWJlOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBgb2JzYCBoYXMgYW55IHN1YnNjcmliZXJzIGxpc3RlbmluZyB0byBldmVudHMuXG4gICAqL1xuICBzdGF0aWMgaGFzU3Vic2NyaWJlcnMob2JzOiBFdmVudEVtaXR0ZXI8YW55Pik6IGJvb2xlYW4geyByZXR1cm4gb2JzLm9ic2VydmVycy5sZW5ndGggPiAwOyB9XG5cbiAgc3RhdGljIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBhbnkpIHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgLSB1c2UgY2FsbEVtaXQoKSBpbnN0ZWFkXG4gICAqL1xuICBzdGF0aWMgY2FsbE5leHQoZW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4sIHZhbHVlOiBhbnkpIHsgZW1pdHRlci5uZXh0KHZhbHVlKTsgfVxuXG4gIHN0YXRpYyBjYWxsRW1pdChlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiwgdmFsdWU6IGFueSkgeyBlbWl0dGVyLmVtaXQodmFsdWUpOyB9XG5cbiAgc3RhdGljIGNhbGxFcnJvcihlbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiwgZXJyb3I6IGFueSkgeyBlbWl0dGVyLmVycm9yKGVycm9yKTsgfVxuXG4gIHN0YXRpYyBjYWxsQ29tcGxldGUoZW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4pIHsgZW1pdHRlci5jb21wbGV0ZSgpOyB9XG5cbiAgc3RhdGljIGZyb21Qcm9taXNlKHByb21pc2U6IFByb21pc2U8YW55Pik6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2VPYnNlcnZhYmxlLmNyZWF0ZShwcm9taXNlKTtcbiAgfVxuXG4gIHN0YXRpYyB0b1Byb21pc2Uob2JqOiBPYnNlcnZhYmxlPGFueT4pOiBQcm9taXNlPGFueT4geyByZXR1cm4gdG9Qcm9taXNlLmNhbGwob2JqKTsgfVxufVxuXG4vKipcbiAqIFVzZSBieSBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRvIGVtaXQgY3VzdG9tIEV2ZW50cy5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIGBaaXBweWAgYWx0ZXJuYXRpdmVseSBlbWl0cyBgb3BlbmAgYW5kIGBjbG9zZWAgZXZlbnRzIHdoZW4gaXRzXG4gKiB0aXRsZSBnZXRzIGNsaWNrZWQ6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd6aXBweScsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgIDxkaXYgY2xhc3M9XCJ6aXBweVwiPlxuICogICAgIDxkaXYgKGNsaWNrKT1cInRvZ2dsZSgpXCI+VG9nZ2xlPC9kaXY+XG4gKiAgICAgPGRpdiBbaGlkZGVuXT1cIiF2aXNpYmxlXCI+XG4gKiAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgICAgPC9kaXY+XG4gKiAgPC9kaXY+YH0pXG4gKiBleHBvcnQgY2xhc3MgWmlwcHkge1xuICogICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAqICAgQE91dHB1dCgpIG9wZW46IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgdG9nZ2xlKCkge1xuICogICAgIHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XG4gKiAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xuICogICAgICAgdGhpcy5vcGVuLmVtaXQobnVsbCk7XG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIHRoaXMuY2xvc2UuZW1pdChudWxsKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFVzZSBSeC5PYnNlcnZhYmxlIGJ1dCBwcm92aWRlcyBhbiBhZGFwdGVyIHRvIG1ha2UgaXQgd29yayBhcyBzcGVjaWZpZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qaHVzYWluL29ic2VydmFibGUtc3BlY1xuICpcbiAqIE9uY2UgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIHNwZWMgaXMgYXZhaWxhYmxlLCBzd2l0Y2ggdG8gaXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXI8VD4gZXh0ZW5kcyBTdWJqZWN0PFQ+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNBc3luYzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBbRXZlbnRFbWl0dGVyXSwgd2hpY2ggZGVwZW5kaW5nIG9uIFtpc0FzeW5jXSxcbiAgICogZGVsaXZlcnMgZXZlbnRzIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpc0FzeW5jOiBib29sZWFuID0gdHJ1ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faXNBc3luYyA9IGlzQXN5bmM7XG4gIH1cblxuICBlbWl0KHZhbHVlOiBUKSB7IHN1cGVyLm5leHQodmFsdWUpOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIC0gdXNlIC5lbWl0KHZhbHVlKSBpbnN0ZWFkXG4gICAqL1xuICBuZXh0KHZhbHVlOiBhbnkpIHsgc3VwZXIubmV4dCh2YWx1ZSk7IH1cblxuICBzdWJzY3JpYmUoZ2VuZXJhdG9yT3JOZXh0PzogYW55LCBlcnJvcj86IGFueSwgY29tcGxldGU/OiBhbnkpOiBhbnkge1xuICAgIGxldCBzY2hlZHVsZXJGbjtcbiAgICBsZXQgZXJyb3JGbiA9IChlcnI6IGFueSkgPT4gbnVsbDtcbiAgICBsZXQgY29tcGxldGVGbiA9ICgpID0+IG51bGw7XG5cbiAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0ICYmIHR5cGVvZiBnZW5lcmF0b3JPck5leHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX2lzQXN5bmMgPyAodmFsdWUpID0+IHsgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQubmV4dCh2YWx1ZSkpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2YWx1ZSkgPT4geyBnZW5lcmF0b3JPck5leHQubmV4dCh2YWx1ZSk7IH07XG5cbiAgICAgIGlmIChnZW5lcmF0b3JPck5leHQuZXJyb3IpIHtcbiAgICAgICAgZXJyb3JGbiA9IHRoaXMuX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0LmVycm9yKGVycikpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiB7IGdlbmVyYXRvck9yTmV4dC5lcnJvcihlcnIpOyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKSB7XG4gICAgICAgIGNvbXBsZXRlRm4gPSB0aGlzLl9pc0FzeW5jID8gKCkgPT4geyBzZXRUaW1lb3V0KCgpID0+IGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSgpKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4geyBnZW5lcmF0b3JPck5leHQuY29tcGxldGUoKTsgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVyRm4gPSB0aGlzLl9pc0FzeW5jID8gKHZhbHVlKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlKSA9PiB7IGdlbmVyYXRvck9yTmV4dCh2YWx1ZSk7IH07XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBlcnJvckZuID1cbiAgICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZXJyb3IoZXJyKSk7IH0gOiAoZXJyKSA9PiB7IGVycm9yKGVycik7IH07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICBjb21wbGV0ZUZuID1cbiAgICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPyAoKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gY29tcGxldGUoKSk7IH0gOiAoKSA9PiB7IGNvbXBsZXRlKCk7IH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLnN1YnNjcmliZShzY2hlZHVsZXJGbiwgZXJyb3JGbiwgY29tcGxldGVGbik7XG4gIH1cbn1cbiJdfQ==